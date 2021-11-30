//created by Leo Sultanov
var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

const oddsLogSchema = mongoose.Schema({
    match_id: {
        type: mongoose.Types.ObjectId,
        ref: "matches"
    },
    match_eid: {
        type: String
    },
    ah_odds_open: {
        type: Object
    },
    ah_odds24h: {
        type: Object
    },
    ah_odds8h: {
        type: Object
    },
    ah_odds4h: {
        type: Object
    },
    ah_odds2h: {
        type: Object
    },
    ah_odds30m: {
        type: Object
    },
    ah_odds_8: {
        type: Object
    },
    ah_odds_12: {
        type: Object
    },
    ah_odds_15: {
        type: Object
    },
    ou_odds_open: {
        type: Object
    },
    ou_odds24h: {
        type: Object
    },
    ou_odds8h: {
        type: Object
    },
    ou_odds4h: {
        type: Object
    },
    ou_odds2h: {
        type: Object
    },
    ou_odds30m: {
        type: Object
    },
    ou_odds_8: {
        type: Object
    },
    ou_odds_12: {
        type: Object
    },
    ou_odds_15: {
        type: Object
    }
});
oddsLogSchema.plugin(uniqueValidator);
var oddsLogSchemaModel = mongoose.model('oddsLog', oddsLogSchema);

module.exports = {
    oddsLogSchemaModel,
}
