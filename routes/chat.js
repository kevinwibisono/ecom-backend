const express = require("express");
const router = express.Router();
const db = require('../db_helper');

router.get("/list/:id_user", async function(req, res){
    //dapatkan list revisi dimana user terlibat
    //setiap id_user lainnya yang unique dapat digunakan untuk menghitung jumlah room user ini
    //sebagai contoh: id_chat|id_user1|id_user2|message
    //1|1|13|hello ; 2|1|13|hi; 3|13|12|lorem ipsum;
    //maka dari sisi user 13, terdapat 2 room dengan 3 message/chat
    
    var id_user = req.params.id_user;
    var query = `SELECT DISTINCT id_user1, id_user2 FROM chat WHERE id_user1 = '${id_user}' OR id_user2 = '${id_user}'`;
    var hasil = await db.executeQuery(query);
    let other_user = "";
    var room = 0;
    for (let i = 0; i < hasil.length; i++) {
      if (hasil[i]['id_user1'] == id_user) {
        if (!other_user.includes(hasil[i]['id_user2'] + "|")){
          other_user += hasil[i]['id_user2'] + "|";
          room++;
        }
      } 
      else if (hasil[i]['id_user2'] == id_user) {
        if (!other_user.includes(hasil[i]['id_user1'] + "|")){
          other_user += hasil[i]['id_user1'] + "|";
          room++;
        }
      }
    }
    query = `SELECT id_chat || '|' || id_user1 || '|' || id_user2 || '|' || message as data FROM chat WHERE id_user1 = '${id_user}' OR id_user2 = '${id_user}'`;
    hasil = await db.executeQuery(query);
    var message = hasil.length;
    res.send({
      "room": room,
      "message": message,
      "summary": hasil
    });
});

router.post("/add", async function(req, res){
    //chat baru yang diketikkan oleh user

    var query = `SELECT COALESCE(MAX(id_chat) + 1,1) FROM chat`;
    var id = await db.executeQuery(query);
    var id_chat = parseInt(id[0]['coalesce']);
    var id_user1 = req.body.id_user1;
    var id_user2 = req.body.id_user2;
    var message = req.body.message;
    var query = `INSERT INTO chat VALUES (${id_chat}, ${id_user1}, ${id_user2}, CURRENT_TIMESTAMP(0), '${message}')`;
    await db.executeQuery(query);
    res.send("Chat berhasil terkirim");
});

module.exports = router;