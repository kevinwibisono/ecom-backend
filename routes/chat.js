const express = require("express");
const router = express.Router();
const db = require('../db_helper');
const { v4: uuidv4 } = require('uuid');
const JWT = require('./../auth');
const { body, validationResult, header } = require('express-validator');

router.post("/post", [
  body('message').not().isEmpty().escape().withMessage('message tidak boleh kosong'),
  body('id_user1').not().isEmpty().escape().withMessage('id_user1 tidak boleh kosong'),
  body('id_user2').not().isEmpty().escape().withMessage('id_user2 tidak boleh kosong'),
], async function(req, res){
  console.log(req.body);
  let result = {};
  result.status = 400;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    result.errors = errors.array();
  }
  else {
    let id_user1 = req.body.id_user1;
    let id_user2 = req.body.id_user2;
    let message = req.body.message;
    try {
      let checkRoom = await db.checkRoom(id_user1, id_user2);
      let roomID = '';
      if(checkRoom.length <= 0) {
        roomID = uuidv4();
        await db.createRoom(roomID, id_user1);
        await db.createRoom(roomID, id_user2);
      }
      else {
        roomID = checkRoom[0].id_room;
      }
      
      await db.postMessage(id_user1, message, roomID);
      result.status = 200;
    } catch (error) {
      console.log(error);
      result.msg = error;
    }
  }
  res.status(result.status).send(result);
});

router.get('/contacts', async function(req, res) {
  let result = {};
  result.status = 401;
  let token = req.header("token");
  let auth = await JWT.authToken(token);
  if(auth.status >= 400) {
      result = auth;
  }
  else {
    try {
      result.data = await db.getContacts(auth.user.id_user);
      result.status = 200;
    } catch (error) {
      console.log(error);
      result.msg = error;
    }
  }
  res.status(result.status).send(result.data);
})

router.get('/chats', [
  header('id_room').not().isEmpty().escape().withMessage('id room tidak boleh kosong'),
], async function(req, res) {
  let result = {};
  result.status = 401;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    result.errors = errors.array();
  }
  else {
    try {
      result.data = await db.getChats(req.headers.id_room);
      result.status = 200;
    } catch (error) {
      console.log(error);
      result.msg = error;
    }
  }
  res.status(result.status).send(result.data);
})

module.exports = router;