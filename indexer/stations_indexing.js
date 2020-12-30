const mongoose = require('mongoose')
const assert   = require('assert')
const request  = require('request')
const logger   = require('simple-node-logger').createSimpleLogger();

const Document = require('../models/stations_schema.js')
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
    /* Cleaning the database to reindex the new api data */
    await Document.deleteMany({})
    logger.info('Mongo database cleaned')

    let stations_promise         = getStations()
    let cleanliness_promise      = getCleanliness()

    let promises                 =
    [
      stations_promise,
      cleanliness_promise,
    ]

    Promise.all(promises).then((response) => {
      logger.info('All responses have been retrieved')
      let stations       = JSON.parse(response[0]).records
      let cleanliness    = JSON.parse(response[1]).records
      let audited_number = 0
      let formatted_sta  = []

      logger.info('Computing starting')

      stations.forEach((station, i) => {
        let station_obj = {
          name: station.fields.gare_alias_libelle_noncontraint,
          dpt_num: station.fields.departement_numero,
          department: station.fields.departement_libellemin,
          city: station.fields.commune_libellemin,
          uic_code: station.fields.uic_code,
          wgs_84: station.fields.wgs_84
        }

        let station_audits = cleanliness.filter(function(s) {
          return s.fields.uic == station.fields.uic_code
        })

        let scores_for_years = []

        formatted_station_audits = []
        station_audits.forEach((object) => {
          let total_checkpoints  = object.fields.nombre_d_observations
          let not_conform_number = object.fields.nombre_de_non_conformites
          let percentage         = object.fields.taux_de_conformite

          let date_str   = object.fields.mois
          let month_str  = date_str.split("-")[1]
          let year_str   = date_str.split("-")[0]
          let audit_date = new Date(parseInt(year_str), parseInt(month_str)+1, 1)

          let year_exist = scores_for_years.find(y => y.year == year_str)
          if(year_exist) {
            year_exist.data.push({month: month_str, value: percentage})
          } else {
            scores_for_years.push(
              {
                year: year_str,
                data: [],
                average_score: 0
              }
            )
          }

          formatted_station_audits.push({
            total_checkpoints: total_checkpoints,
            not_conform_number: not_conform_number,
            month: audit_date,
          })
        })

        if(station_audits.length != 0) {
          audited_number++
        }

        scores_for_years.forEach((year_data) => {
          let sum = Object.keys(year_data.data).reduce(function (previous, key) {
              return previous + year_data.data[key].value;
          }, 0);

          let mean = (sum/year_data.data.length)
          if(mean && mean != 0) {
            year_data.average_score = parseFloat(mean)
          } else {
            year_data.average_score = -1
          }
        });


        station_obj.audits_number = station_audits.length
        station_obj.audits        = formatted_station_audits
        station_obj.scores_for_years = scores_for_years
        formatted_sta.push(station_obj)
      });

      logger.info('Database insertions')

      Document.insertMany(formatted_sta).then(function() {
        logger.info("Data have been inserted successfuly !")
      })

    }).catch(console.error)
});


function getStations() {
  return new Promise((resolve, reject) => {
    request(`${Endpoint}?dataset=referentiel-gares-voyageurs&rows=-1`, function (error, response, body) {
      if (!error && response.statusCode == 200) {
          resolve(body)
      } else {
          reject(error)
      }
    });
  })
}

function getCleanliness() {
  return new Promise((resolve, reject) => {
    request(`${Endpoint}/?dataset=proprete-en-gare&q=&rows=-1`, function (error, response, body) {
      if (!error && response.statusCode == 200) {
          resolve(body)
      } else {
          reject(error)
      }
    });
  })
}

function getHandicapFacilities() {
  return new Promise((resolve, reject) => {
    request(`${Endpoint}/?dataset=services-dassistance-dans-les-gares-transilien&q=&rows=-1`, function (error, response, body) {
      if (!error && response.statusCode == 200) {
          resolve(body)
      } else {
          reject(error)
      }
    });
  })
}

function getWifiEquipment() {
  return new Promise((resolve, reject) => {
    request(`${Endpoint}/?dataset=gares-equipees-du-wifi&rows=-1`, function (error, response, body) {
      if (!error && response.statusCode == 200) {
          resolve(body)
      } else {
          reject(error)
      }
    });
  })
}

function getSalesWaitingTime() {
  return new Promise((resolve, reject) => {
    request(`${Endpoint}/?dataset=attente-au-guichet&rows=-1`, function (error, response, body) {
      if (!error && response.statusCode == 200) {
          resolve(body)
      } else {
          reject(error)
      }
    });
  })
}

function getWaitingServices() {
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
