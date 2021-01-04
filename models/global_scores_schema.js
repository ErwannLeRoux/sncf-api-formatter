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
    average_score: "Number"
});

documentSchema.set('collection', 'global_scores');

module.exports = mongoose.model('GlobalScores', documentSchema);
