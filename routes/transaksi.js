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

router.post("/addIpaymu", async function(req, res){
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

router.post("/addTransaksiBySid/:sid", async function(req, res){
    //begitu buyer melewati tahap pembayaran, maka tambahkan transaksi ke database
    let response = await db.executeQuery(`SELECT * FROM transaksi_ipaymu WHERE sessionID = '${req.params.sid}'`);
    let today = new Date();
    let tgl_transaksi = today.getFullYear+"-"+(today.getMonth()+1)+"-"+today.getDate;
    await db.executeQuery(`INSERT INTO transaksi(id_seller, id_buyer, id_gigs, tier_number, gigs_quantity, website_fee, extras, total, tgl_transaksi) VALUES(${response[0].id_seller}, ${response[0].id_buyer}, ${response[0].id_gigs}, ${response[0].tier_number}, ${response[0].gigs_quantity}, ${response[0].website_fee}, '${response[0].extras}', ${response[0].total}, '${tgl_transaksi}')`);
    res.status(200).send("Berhasil menambahkan transaksi baru");
});

module.exports = router;