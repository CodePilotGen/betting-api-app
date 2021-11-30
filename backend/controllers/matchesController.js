"use strict";
//created by Leo
const Joi = require('joi');
const {matchSchemaModel} = require('../models/matchModel');

module.exports = {

    getAllMatches: async (req, res) => {

        const matches = await matchSchemaModel.find().sort({createdAt: -1});

        if (!matches) {
            res.status(500).json({error: true, data: "no matches found !"});
        } else {
            res.status(200).json({error: false, matches: matches});
        }

    }
    
};