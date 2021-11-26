//created by Leo Sultanov
var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

const matchSchema = mongoose.Schema({
    date: {
        type: String
    },
    eid: {
        type: String,
        unique: true,
        required: true,
        trim: true,
    },
    country: {
        type: String,
        required: true
    },
    sport: String,
    league: String,
    timezone: String,
    day: {
        type: String
    },
    hour: {
        type: String
    },
    year: {
        type: String
    },
    tournament_url: {
        type: String
    },
    status: {
        type: String
    },
    match: {
        type: String
    },
    url: {
        type: String
    },
    odds: {
        local: {
            avg: Number,
            max: Number
        },
        draw: {
            avg: Number,
            max: Number
        },
        visitor: {
            avg: Number,
            max: Number
        }
    },
    league_id: {
        type: mongoose.Types.ObjectId,
        ref: "leagues"
    },
    league_eid: {
        type: String
    },
    data: {
        daylastupdated: String,
        timelastupdated: String,
        url: String,
        day: String,
        tournament: String,
        match: String,
        local: String,
        away: String,
        xcode: String,
        isLive: Boolean,
        isPostponed: Boolean,
        isStarted: Boolean,
        isFinished: Boolean
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
    },
});
matchSchema.plugin(uniqueValidator);
var matchSchemaModel = mongoose.model('matches', matchSchema);

module.exports = {
    matchSchemaModel,
}
