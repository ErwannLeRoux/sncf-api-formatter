const mongoose = require('mongoose');

const documentSchema = mongoose.Schema({
    _id: "ObjectId",
    city: "String",
    name: "String",
    department: "String"
});

documentSchema.set('collection', 'data');

module.exports = mongoose.model('Document', documentSchema);
