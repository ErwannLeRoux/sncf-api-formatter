const mongoose = require('mongoose');

const documentSchema = mongoose.Schema({
    _id: "ObjectId",
    dep_name: "String",
    region_name: "String",
    num_dep: "String"
});

documentSchema.set('collection', 'departments');

module.exports = mongoose.model('Departement', documentSchema);
