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
    //dapatkan list transaksi dimana user terlibat
    
});

router.post("/add", function(req, res){
    //begitu buyer melewati tahap pembayaran, maka tambahkan transaksi ke database
    
});

router.put("/update/:id_transaksi", function(req, res){
    //update status transaksi yang dilakukan oleh seller dan buyer (konfirmasi selesai)
    
});

process.on("exit", function(){
    client.end();
});

module.exports = router;