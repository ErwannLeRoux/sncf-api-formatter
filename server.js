const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const Document = require('./models/record_schema.js')

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
        let results = await Document.find()

        results.forEach((item) => {
            console.log(item)
        });
    });

    app.use(bodyParser.urlencoded({ extended: false }))

    app.use(bodyParser.json())

    app.set('view engine', 'ejs')

    app.use('/assets', express.static('public'))

    router.get('/', (request, response) => {
        response.send({status: 'Ok'})
    });

    app.use('/', router)

    app.listen(8080)
}

main()
