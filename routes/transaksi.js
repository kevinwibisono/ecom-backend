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

router.post("/addIpaymu", function(req, res){
    //begitu buyer melewati tahap pembayaran, maka tambahkan transaksi ke database
    let sid = req.body.sessionID;
    let id_seller = req.body.id_seller;
    let id_buyer = req.body.id_buyer;
    let id_gigs = req.body.id_gigs;
    let tier_number = req.body.tier_number;
    let gigs_quantity = req.body.gigs_quantity;
    let website_fee = req.body.website_fee;
    let extras = req.body.extras;
    let total = req.body.total;

    await db.executeQuery(`INSERT INTO transaksi_ipaymu VALUES('${sid}', ${id_seller}, ${id_buyer}, ${id_gigs}, ${tier_number}, ${gigs_quantity}, ${website_fee}, '${extras}', ${total})`);
    res.status(200).send("Berhasil menambahkan ipaymu transaction");
});

router.post("/addTransaksiBySid/:sid", function(req, res){
    //begitu buyer melewati tahap pembayaran, maka tambahkan transaksi ke database
    let res = await db.executeQuery(`SELECT * FROM transaksi_ipaymu WHERE sessionID = '${req.params.sid}'`);
    let today = new Date();
    let tgl_transaksi = today.getFullYear+"-"+(today.getMonth()+1)+"-"+today.getDate;
    await db.executeQuery(`INSERT INTO transaksi(id_seller, id_buyer, id_gigs, tier_number, gigs_quantity, website_fee, extras, total, tgl_transaksi) VALUES(${res[0].id_seller}, ${res[0].id_buyer}, ${res[0].id_gigs}, ${res[0].tier_number}, ${res[0].gigs_quantity}, ${res[0].website_fee}, '${res[0].extras}', ${res[0].total}, '${tgl_transaksi}')`);
    res.status(200).send("Berhasil menambahkan transaksi baru");
});

module.exports = router;