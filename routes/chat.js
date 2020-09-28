const express = require("express");
const router = express.Router();

const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  //connectionString : "postgres://ctozguylmpohhh:0a5eab1011e400db3abdd56619fd04bb48a7ce8e06084c7da3f6cce201e405b0@ec2-54-152-40-168.compute-1.amazonaws.com:5432/d69f8sptghs3ev",
  ssl: {rejectUnauthorized: false},
});
client.connect();

function executeQuery(query){
    return new Promise(function(resolve, reject){
      client.query(query, (err, res) => {
        if(err) reject(err);
        else resolve(res.rows);
      });
    });
}

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

process.on("exit", function(){
    client.end();
});

module.exports = router;