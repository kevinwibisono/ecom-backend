const express = require("express");
const router = express.Router();
const db = require('../db_helper');
const { v4: uuidv4 } = require('uuid');

const { body, validationResult, header } = require('express-validator');

// router.get("/list/:id_user", async function(req, res){
//     //dapatkan list revisi dimana user terlibat
//     //setiap id_user lainnya yang unique dapat digunakan untuk menghitung jumlah room user ini
//     //sebagai contoh: id_chat|id_user1|id_user2|message
//     //1|1|13|hello ; 2|1|13|hi; 3|13|12|lorem ipsum;
//     //maka dari sisi user 13, terdapat 2 room dengan 3 message/chat
    
//     var id_user = req.params.id_user;
//     var query = `SELECT DISTINCT id_user1, id_user2 FROM chat WHERE id_user1 = '${id_user}' OR id_user2 = '${id_user}'`;
//     var hasil = await db.executeQuery(query);
//     let other_user = "";
//     var room = 0;
//     for (let i = 0; i < hasil.length; i++) {
//       if (hasil[i]['id_user1'] == id_user) {
//         if (!other_user.includes(hasil[i]['id_user2'] + "|")){
//           other_user += hasil[i]['id_user2'] + "|";
//           room++;
//         }
//       } 
//       else if (hasil[i]['id_user2'] == id_user) {
//         if (!other_user.includes(hasil[i]['id_user1'] + "|")){
//           other_user += hasil[i]['id_user1'] + "|";
//           room++;
//         }
//       }
//     }
//     query = `SELECT id_chat || '|' || id_user1 || '|' || id_user2 || '|' || message as data FROM chat WHERE id_user1 = '${id_user}' OR id_user2 = '${id_user}'`;
//     hasil = await db.executeQuery(query);
//     var message = hasil.length;
//     res.send({
//       "room": room,
//       "message": message,
//       "summary": hasil
//     });
// });

// router.post("/add", async function(req, res){
//     //chat baru yang diketikkan oleh user

//     var query = `SELECT COALESCE(MAX(id_chat) + 1,1) FROM chat`;
//     var id = await db.executeQuery(query);
//     var id_chat = parseInt(id[0]['coalesce']);
//     var id_user1 = req.body.id_user1;
//     var id_user2 = req.body.id_user2;
//     var message = req.body.message;
//     var query = `INSERT INTO chat VALUES (${id_chat}, ${id_user1}, ${id_user2}, CURRENT_TIMESTAMP(0), '${message}')`;
//     await db.executeQuery(query);
//     res.send("Chat berhasil terkirim");
// });

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

router.get('/contacts', [
  header('id_user').not().isEmpty().escape().withMessage('id user tidak boleh kosong'),
], async function(req, res) {
  let result = {};
  result.status = 401;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    result.errors = errors.array();
  }
  else {
    try {
      result.data = await db.getContacts(req.headers.id_user);
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