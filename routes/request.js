const express = require("express");
const router = express.Router();
const db = require('../db_helper');

router.get("/list/:id_user", function(req, res){
    //dapatkan list request yang telah dibuat oleh seorang user
    
});

router.post("/add", function(req, res){
    //post data-data untuk request baru
    
});

router.put("/update/:id_req", function(req, res){
    //post data-data baru untuk request
    
});

router.delete("/delete/:id_req", function(req, res){
    //delete request dengan id yang diberikan

});

module.exports = router;