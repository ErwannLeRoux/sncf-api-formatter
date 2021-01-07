const mongoose = require('mongoose');

const documentSchema = mongoose.Schema({
    _id: "ObjectId",
    city: "String",
    name: "String",
    department: "String",
    uic_code: "String",
    dpt_num: "Number",
    region_name: "String",
    wgs_84: [],
    scores_for_years: [
      {
        year: "String",
        data: [
          {
            month: "String",
            value: "Number",
            not_conform_number: "Number",
            total_checkpoints : "Number",
            year: "String"
          }
        ],
        average_score: "Number"
      }
    ],
    audits: [
      {
        total_checkpoints: "Number",
        not_conform_number: "Number",
        month: "Date"
      }
    ],
});

documentSchema.set('collection', 'data');

module.exports = mongoose.model('Stations', documentSchema);
