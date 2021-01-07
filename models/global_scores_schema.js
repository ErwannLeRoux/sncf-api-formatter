const mongoose = require('mongoose');

const documentSchema = mongoose.Schema({
    _id: "ObjectId",
    year: "String",
    audit_number: "Number",
    data: [

        {
            month: "String",
            value: "Number"
        }
    ],
    average_score: "Number",
    audit_high: "Number",
    audit_medium: "Number",
    audit_low: "Number"
});

documentSchema.set('collection', 'global_scores');

module.exports = mongoose.model('GlobalScores', documentSchema);
