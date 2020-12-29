const mongoose = require('mongoose');

const documentSchema = mongoose.Schema({
    _id: "ObjectId",
    station_name: "String"
});

documentSchema.set('collection', 'data');

module.exports = mongoose.model('Document', documentSchema);
