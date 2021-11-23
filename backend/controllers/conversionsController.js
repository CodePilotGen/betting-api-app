"use strict";
//created by Hatem Ragap
const {roomsSchemaModel} = require("../models/conversionsModel");


const _ = require("underscore");
module.exports = {
    createChatRoom: async (req, res) => {
        const {user_one, user_two, lastMessage} = req.body;
        if (user_two && user_one && lastMessage) {
            let msg = {
                users_see_message: [user_one],
                message: lastMessage
            };

            let chat = await roomsSchemaModel.findOne({users: {$all: [user_one, user_two]}});

            if (chat === null) {
                //create new Conversation
                const roomModel = new roomsSchemaModel({users: [user_one, user_two], lastMessage: msg},);

                roomModel.save(async err => {
                    if (err) {
                        res.status(400).send({error: true, data: err})
                    } else {
                        res.send({error: false, data: roomModel})
                    }

                });
            } else {
                //just send this message on this conversation and send Notification
                res.send({error: false, data: chat})
            }
        } else {
            res.status(400).send({error: true, data: 'missing some args user_one user_two lastMessage'})
        }
    },
    getUserChats: async (req, res) => {
        let userId = req.body.user_id;
        if (!userId) {
            userId = req.user._id;
        }
        if (userId) {
            let listOfOnlineAndOffline = {"user 1 id ": true};
            const keys = Object.keys(listOfOnlineAndOffline);
            let result = {};
            try {
                let chats = await roomsSchemaModel.find({users: userId}).sort({updatedAt: -1}).populate("users", "_id name email gender role avatarUrl online like dislike coverage");
                
                result.error = false;
                result.data = chats;
                result.onLineUsersId = keys;

                res.send({error: false, data: chats, onLineUsersId: keys})
            } catch (error) {
                result.onLineUsersId = [];
                result.error = true;
                result.data = `there are error ${error}`;
                res.status(400).send({error: true, data: result})
            }

        } else {
            res.status(400).send({error: true, data: 'user_id is empty'})
        }
    },
    removeChatRoom: async (req, res) => {
        const {chat_id} = req.body;
        await roomsSchemaModel.findByIdAndRemove(chat_id).exec((err) => {
            if (err) {
                res.status(400).send({error: true, data: err.message});
            }
            else {
                res.send({error: false, data: "Removed Successfully"});
            }
        });
    },
};











