require('dotenv').config()

const fs         = require('fs')
const express    = require('express')
const bodyParser = require('body-parser')
const mongoose   = require('mongoose')
const logger     = require('simple-node-logger').createSimpleLogger();
const cors       = require('cors')

const Stations     = require('./models/stations_schema.js')
const Departement  = require('./models/departments_schema.js')
const GlobalScores = require('./models/global_scores_schema.js')

async function main() {
    let router = express.Router();
    let app = express()

    let db = mongoose.connection;

    mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        pass: process.env.DB_PWD,
        user: process.env.DB_USERNAME
    });

    db.on('error', console.error)

    db.once('open', async function() {
        logger.info("Connection established with database")
        logger.info("Server is ready to handle requests")
    });

    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())
    app.use(cors())

    app.set('view engine', 'ejs')

    app.use('/assets', express.static('public'))

    router.get('/', (request, response) => {
        response.send({status: 'Ok'})
    });

    router.get('/top5', async (request, response) => {
        let year     = request.query.year
        let stations = []

        stations = await Stations.find({
            'audits' :
                {
                    $exists: true,
                    $not: {
                        $size: 0
                    }
                },
            scores_for_years:
                {
                    $elemMatch:
                        {
                            year: year
                        }
                }
        })

        if(year && year != '') {
            stations.forEach((s) => {
                let scores       = s.scores_for_years
                let concern_year = scores.find(y => y.year == year)
                if(!concern_year) {
                    s.scores_for_years = []
                }
            })
        }

        stations.sort((a,b)=>  {
            let row_a = a.scores_for_years.find(y => y.year == year)
            let row_b = b.scores_for_years.find(y => y.year == year)
            let avg_a = row_a.average_score
            let avg_b = row_b.average_score
            return avg_b - avg_a
        })

        stations = stations.slice(0, 5)

        response.send({
            status: '200',
            data: stations
        })
    });

    router.get('/worst5', async (request, response) => {
        let year     = request.query.year
        let stations = []

        stations = await Stations.find({
            'audits' :
                {
                    $exists: true,
                    $not: {
                        $size: 0
                    }
                },
            scores_for_years:
                {
                    $elemMatch:
                        {
                            year: year
                        }
                }
        })

        if(year && year != '') {
            stations.forEach((s) => {
                let scores       = s.scores_for_years
                let concern_year = scores.find(y => y.year == year)
                if(!concern_year) {
                    s.scores_for_years = []
                }
            })
        }

        stations.sort((a,b)=>  {
            let row_a = a.scores_for_years.find(y => y.year == year)
            let row_b = b.scores_for_years.find(y => y.year == year)
            let avg_a = row_a.average_score
            let avg_b = row_b.average_score
            return avg_a  - avg_b
        })

        stations = stations.slice(0, 5)

        response.send({
            status: '200',
            data: stations
        })
    });

    router.get('/departments', async (request, response) => {
        let region = request.query.region;
        let departments = []
        if(!region) {
            departments = await Departement.find()
        } else {
            departments = await Departement.find({
                region_name: region
            })
        }
        response.send({
            status: '200',
            data: departments
        })
    });

    router.get('/stations', async (request, response) => {
        let region_name = request.query.region
        let num_dep     = request.query.num_dep
        let year        = request.query.year
        let mode        = request.query.mode
        let filter      = {}
        let stations    = []

        /* handle invalid request */
        if(num_dep && region_name) {
            response.send({
                status: '422',
                error: 'You can\t specify both department and region'
            })
        }

        /* build audit restriction */
        if(mode == 'audited-only') {
            filter = {'audits' : { $exists: true, $not: {$size: 0}}}
        } else if(mode == 'non-audited-ony') {
            filter = {'audits' : { $exists: true,  $size: 0}}
        }

        /* build departement or region restriction */
        if(num_dep && num_dep != '') {
            filter['dpt_num'] = parseInt(num_dep)
        } else if(region_name && region_name != '') {
            let departments = await Departement.find({
                region_name: region_name
            })

            filter['$or'] = []

            departments.forEach((item) => {
                filter.$or.push({dpt_num: item.num_dep})
            });
        }

        stations = await Stations.find(filter)

        /* build year filtering */
        if(year && year != '') {
            stations.forEach((s) => {
                let scores       = s.scores_for_years
                let concern_year = scores.find(y => y.year == year)
                if(!concern_year) {
                    s.scores_for_years = []
                } else {
                    s.scores_for_years = concern_year
                }
            })
        }

        response.send({
            status: '200',
            data: stations
        })
    });

    router.get('/station/:uic', async (request, response) => {
        let uic = request.params.uic;
        console.log(uic)
        let station = await Stations.find({uic_code: uic})
        response.send({
            status: '200',
            data: station
        })
    });

    router.get('/global_scores', async (request, response) => {
        let year = request.query.year
        let scores = []

        if(year) {
            scores = await GlobalScores.find({"year": year})
        } else {
            scores = await GlobalScores.find({})
        }

        response.send({
            status: '200',
            data: scores
        })
    });

    router.get('/regions', async (request, response) => {
        let rawdata = fs.readFileSync('./indexer/resources/regions.json');
        let regions = JSON.parse(rawdata);
        response.send({
            status: '200',
            data: regions
        })
    });

    app.use('/', router)

    app.listen(8081)
}

main()
