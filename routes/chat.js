const express = require("express");
const router = express.Router();
const db = require('../db_helper');

router.get("/list/:id_user", function(req, res){
    //dapatkan list revisi dimana user terlibat
    //setiap id_user lainnya yang unique dapat digunakan untuk menghitung jumlah room user ini
    //sebagai contoh: id_chat|id_user1|id_user2|message
    //1|1|13|hello ; 2|1|13|hi; 3|13|12|lorem ipsum;
    //maka dari sisi user 13, terdapat 2 room dengan 3 message/chat
    
});

router.post("/add", function(req, res){
    //chat baru yang diketikkan oleh user
    
});

module.exports = router;