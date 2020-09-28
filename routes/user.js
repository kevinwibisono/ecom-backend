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

router.post("/register", function(req, res){
  //post data-data untuk registrasi
  
});

router.post("/login", function(req, res){
    //post email & password, cek login

});

router.post("/register_seller", function(req, res){
  //post data-data untuk menjadi seller (skillset, bio, photo_dir, education)
  
});

router.put("/update", function(req, res){
  //post data-data baru dari update profile
  
});

process.on("exit", function(){
    client.end();
});

module.exports = router;