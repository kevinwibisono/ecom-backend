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

router.get("/search", function(req, res){
    //search gigs tertentu
    //bisa menyertakan params seperti query, filter & sort type
    //jika mengandung parameter query, maka tampilkan category pada filter
      //jika tidak, tidak perlu menampilkan category sebagai filter
    
});

router.get("/detail/id", function(req, res){
  //mendapatkan detail gigs dengan id tertentu
  //termasuk mendapatkan review, penyedia jasa & faq dengan id gigs tersebut
  //hasil res.send akan mengembalikan object gigs dimana dalamnya terdapat array of reviews + array of faq

});

router.get("/list/:id_user", function(req, res){
  //mendapatkan daftar gigs milik user tertentu

});

router.post("/add", function(req, res){
  //menambahkan gigs baru
  //termasuk menambahkan faq

});

router.put("/update/:id_gigs", function(req, res){
  //update gigs dengan data-data baru

});

router.delete("/delete/:id_gigs", function(req, res){
  //update gigs dengan data-data baru

});

process.on("exit", function(){
    client.end();
});

module.exports = router;