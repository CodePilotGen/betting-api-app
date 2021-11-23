"use strict";
//created by Hatem Ragap
const express = require("express");
const conversionsRouter = new express.Router();
const conversionsController = require('../controllers/conversionsController');
const { verifyToken } = require('../middlewares/authHandler');

conversionsRouter.post("/create", verifyToken, conversionsController.createChatRoom);
conversionsRouter.post("/getUserChats", verifyToken, conversionsController.getUserChats);
conversionsRouter.post("/remove", verifyToken, conversionsController.removeChatRoom);

module.exports = conversionsRouter;