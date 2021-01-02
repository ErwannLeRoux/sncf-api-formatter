const mongoose = require('mongoose')
const fs = require('fs');

const logger   = require('simple-node-logger').createSimpleLogger();

const Departement = require('../models/departments_schema.js')

let db = mongoose.connection;

mongoose.connect('mongodb://antoinegonzalez.fr:27017/sncf', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  pass: 'sncfuser',
  user: 'sncfuser'
});

db.on('error', console.error)

db.once('open', async function() {
    /* Cleaning the database to reindex the new api data */
    await Departement.deleteMany({})
    logger.info('Mongo database departements cleaned')

    let rawdata = fs.readFileSync('./resources/departements-region.json');
    let departments = JSON.parse(rawdata);

    Departement.insertMany(departments).then(function() {
      logger.info("Data have been inserted successfuly !")
    })
});
