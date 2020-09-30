const express = require("express");
const router = express.Router();
const db = require('../db_helper');

router.get("/list/:id_user", function(req, res){
  //mendapatkan daftar gigs favorit milik user tertentu

});

router.post("/add", function(req, res){
  //menambahkan gigs ke dalam daftar favorit

});

router.delete("/delete/:id_favorit", function(req, res){
  //hapus item dari favorit
 
});

module.exports = router;