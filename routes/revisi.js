const express = require("express");
const router = express.Router();
const db = require('../db_helper');

router.get("/list/:id_transaksi", function(req, res){
    //dapatkan list revisi yang terdapat thd transaksi ini
    //jumlahnya dapat digunakan untuk menentukan apakah masih bisa revisi lagi (batas)
    
});

router.post("/add", function(req, res){
    //revisi baru yang ditambahkan buyer
    
});

router.put("/update/:id_revisi", function(req, res){
    //untuk update ketika file revisi diganti/diupload oleh penyedia jasa
    
});

module.exports = router;