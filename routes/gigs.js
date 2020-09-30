const express = require("express");
const router = express.Router();
const db = require('../db_helper');

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

module.exports = router;