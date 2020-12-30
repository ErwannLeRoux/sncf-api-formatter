const mongoose = require('mongoose');

const documentSchema = mongoose.Schema({
    _id: "ObjectId",
    city: "String",
    name: "String",
    department: "String",
    uic_code: "String",
    audits: [
      {
        total_checkpoints: "Number",
        not_conform_number: "Number",
        month: "String"
      }
    ],
});

documentSchema.set('collection', 'data');

module.exports = mongoose.model('Document', documentSchema);
