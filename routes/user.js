const express = require("express");
const router = express.Router();
const db = require('../db_helper');

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

module.exports = router;