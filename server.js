const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const logger   = require('simple-node-logger').createSimpleLogger();

const Stations = require('./models/stations_schema.js')
const Departement = require('./models/departments_schema.js')
const GlobalScores = require('./models/global_scores_schema.js')

async function main() {
    let router = express.Router();
    let app = express()

    let db = mongoose.connection;

    mongoose.connect('mongodb://antoinegonzalez.fr:27017/sncf', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      pass: 'sncfuser',
      user: 'sncfuser'
    });

    db.on('error', console.error)

    db.once('open', async function() {
      logger.info("Connection established with database")
      logger.info("Server is ready to handle requests")
    });

    app.use(bodyParser.urlencoded({ extended: false }))

    app.use(bodyParser.json())

    app.set('view engine', 'ejs')

    app.use('/assets', express.static('public'))

    router.get('/', (request, response) => {
      response.send({status: 'Ok'})
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
      let num_dep = request.query.num_dep
      let region_name = request.query.region

      if(num_dep && region_name) {
        response.send({
          status: '422',
          error: 'You can\t specify both department and region'
        })
      }

      let stations = []
      if(num_dep) {
        stations = await Stations.find({dpt_num : parseInt(num_dep)})
      } else if(region_name) {
        let departments = await Departement.find({
          region_name: region_name
        })

        // build filter
        let filter = {
          $or: []
        }

        departments.forEach((item, i) => {
          filter.$or.push({dpt_num: item.num_dep})
        });

        stations = await Stations.find(filter)

        response.send({
          status: '200',
          data: stations
        })
      } else {
        // return all stations if no filter
        stations = await Stations.find({})
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

    app.use('/', router)

    app.listen(8080)
}

main()
