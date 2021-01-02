const mongoose = require('mongoose');

const documentSchema = mongoose.Schema({
    _id: "ObjectId",
    dep_name: "String",
    region_name: "String",
    num_dep: "String",
    lat: "Number",
    lng: "Number",
    region_lat: "Number",
    region_lng: "Number"
});

documentSchema.set('collection', 'departments');

module.exports = mongoose.model('Departement', documentSchema);
