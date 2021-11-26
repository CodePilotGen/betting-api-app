//created by Leo Sultanov
var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

const leagueSchema = mongoose.Schema({
    eid: {
        type: String,
        unique: true,
        required: true,
        trim: true,
    },
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    }
});
leagueSchema.plugin(uniqueValidator);
var leagueSchemaModel = mongoose.model('leagues', leagueSchema);

module.exports = {
    leagueSchemaModel,
}
