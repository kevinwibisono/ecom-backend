const express = require("express");
const router = express.Router();
const db = require('../db_helper');

router.get("/list/:id_user", function(req, res){
    //dapatkan list transaksi dimana user terlibat
    
});

router.post("/add", function(req, res){
    //begitu buyer melewati tahap pembayaran, maka tambahkan transaksi ke database
    
});

router.put("/update/:id_transaksi", function(req, res){
    //update status transaksi yang dilakukan oleh seller dan buyer (konfirmasi selesai)
    
});

module.exports = router;