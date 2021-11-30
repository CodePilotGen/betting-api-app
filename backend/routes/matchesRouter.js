"use strict";
//created by Hatem Ragap
const express = require("express");
const router = new express.Router();
const matchesController = require('../controllers/matchesController');

router.get("/", matchesController.getAllMatches); //

module.exports = router;
