const mongoose = require('mongoose')
const assert   = require('assert')
const request  = require('request')
const Document = require('../models/record_schema.js')
const Endpoint = 'http://data.sncf.com/api/records/1.0/search'
let db = mongoose.connection;

mongoose.connect('mongodb://antoinegonzalez.fr:27017/sncf', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  pass: 'sncfuser',
  user: 'sncfuser'
});

db.on('error', console.error)

db.once('open', async function() {
    //clean the database to reindex the new api data
    await Document.deleteMany({})
    let promises = []

    let stations = []
    fetchStations().then(function(res) {
      let obj = JSON.parse(res)
      obj.records.forEach((station, i) => {
        let city = station.fields.commune
        let name = station.fields.libelle
        let dpt  = station.fields.departemen
        stations.push({city: city, name: name, department: dpt})
      });
      Document.insertMany(stations).then(function() {
        console.log("inserted !")
      })
    })




});


function fetchStations() {
  return new Promise((resolve, reject) => {
    request(`${Endpoint}/?dataset=liste-des-gares&q=&rows=-1`, function (error, response, body) {
      if (!error && response.statusCode == 200) {
          resolve(body)
      } else {
          reject(error)
      }
    });
  })
}
