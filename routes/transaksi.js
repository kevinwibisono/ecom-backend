const express = require("express");
const router = express.Router();
const db = require('../db_helper');
const multer = require('multer');
const { all } = require("./gigs");
let filename = '';

function generateIpaymuLink(dataForm){
    return new Promise(function(resolve, reject){
        var request = require('request');
        var options = {
            'method': 'POST',
            'url': 'https://sandbox.ipaymu.com/payment',
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            formData: dataForm
        };
        request(options, function (error, response) {
            if (error) reject(error);
            else resolve(response.body);
        });
    });
}

const storage=multer.diskStorage({
  destination: './uploads/orders',
  filename:function(req,file,cb){
    filename = file.originalname;
    cb(null,file.originalname);
  }
});

const upload=multer({
  storage: storage
}).single('file');

router.get("/", async function(req, res){
    let result = {};
    result.status = 401;
    try {
        let allTrans = await db.getAllTrans();
        for(let idx in allTrans) {
            await db.getUserNama(allTrans[idx].id_buyer).then(res => {
                allTrans[idx].id_buyer = res.nama;
                allTrans[idx].jenis_rek = res.jenis_rek;
                allTrans[idx].no_rek = res.no_rek;
            });
            await db.getUserNama(allTrans[idx].id_seller).then(res => {
                allTrans[idx].id_seller = res.nama;
                allTrans[idx].jenis_rek = res.jenis_rek;
                allTrans[idx].no_rek = res.no_rek;
            });
            allTrans[idx].id_gigs = await db.getGigName(allTrans[idx].id_gigs);
            allTrans[idx].action = allTrans[idx].id_transaksi;
        }
        result.data = allTrans;
        result.status = 200;
    } catch (error) {
      console.log(error);
      result.msg = error;
    }
    res.status(result.status).send(result);
});

router.post("/konfirmBayar", async function(req, res){
    let result = {};
    result.status = 401;
    console.log("masuk");
    console.log(req.body.id_trans);
    try {
        let id_trans = req.body.id_trans || '';
        if(id_trans != '') {
            await db.konfirmBayar(id_trans);
            result.msg = "success";
            result.status = 200;
        }
        else {
            result.msg = "id transaksi tidak boleh kosong";
        }
    } catch (error) {
        console.log(error);
         result.msg = error;
    }
    res.status(result.status).send(result);
});

router.get("/list/:id_user/:type", async function(req, res){
    //dapatkan list transaksi dimana user terlibat
    let query = "";
    if(req.params.type == 1){
        //lihat sebagai buyer
        query = `SELECT t.id_transaksi, t.website_fee, t.duration, t.revision, t.revision_left, t.id_gigs, t.directory_file, t.status_transaksi, t.tier_number, t.gigs_quantity, t.extras, t.total, u.nama as seller_name, to_char(t.tgl_transaksi, 'DD Mon YYYY') as tgl_transaksi, to_char(t.tgl_accept, 'DD Mon YYYY') as tgl_accept, to_char(t.tgl_target, 'DD Mon YYYY') as tgl_target, to_char(t.tgl_deliver, 'DD Mon YYYY') as tgl_deliver, to_char(t.tgl_selesai, 'DD Mon YYYY') as tgl_selesai, g.judul, p.directory_file as gambar_gig FROM transaksi t, gigs g, user_table u, gigs_pictures p WHERE t.id_gigs = g.id_gigs and t.id_seller = u.id_user and t.id_gigs = p.id_gigs and p.number = 1 and id_buyer = ${req.params.id_user}`;
    }
    else if(req.params.type == 2){
        //lihat sebagai seller
        query = `SELECT t.id_transaksi, t.website_fee, t.duration, t.revision, t.revision_left, t.id_gigs, t.directory_file, t.status_transaksi, t.tier_number, t.gigs_quantity, t.extras, t.total, u.nama as buyer_name, to_char(t.tgl_transaksi, 'DD Mon YYYY') as tgl_transaksi, to_char(t.tgl_accept, 'DD Mon YYYY') as tgl_accept, to_char(t.tgl_target, 'DD Mon YYYY') as tgl_target, to_char(t.tgl_deliver, 'DD Mon YYYY') as tgl_deliver, to_char(t.tgl_selesai, 'DD Mon YYYY') as tgl_selesai, g.judul, p.directory_file as gambar_gig FROM transaksi t, gigs g, user_table u, gigs_pictures p WHERE t.id_gigs = g.id_gigs and t.id_buyer = u.id_user and t.id_gigs = p.id_gigs and p.number = 1 and id_seller = ${req.params.id_user}`;
    }
    let listorder = await db.executeQuery(query);
    res.status(200).send(listorder);
});

router.get("/listRevision/:id_transaksi", async function(req, res){
    //dapatkan list transaksi dimana user terlibat
    let query = `SELECT * FROM revisi WHERE id_transaksi = ${req.params.id_transaksi} ORDER BY id_revisi`;
    let listrevisi = await db.executeQuery(query);
    res.status(200).send(listrevisi);
});

router.post("/addRevision/:id_transaksi", async function(req, res){
    let today = new Date();
    let tgl_revisi = today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate();
    await db.executeQuery(`INSERT INTO revisi(id_transaksi, tgl_revisi, alasan_revisi) VALUES(${req.params.id_transaksi}, '${tgl_revisi}', '${req.body.alasan}')`);
    await db.executeQuery(`UPDATE transaksi SET revision_left = revision_left - 1 WHERE id_transaksi = ${req.params.id_transaksi}`);
    let response = await db.executeQuery('SELECT * FROM revisi WHERE id_revisi IN (SELECT max(id_revisi) FROM revisi)');
    res.status(200).send(response[0]);
});

router.post("/handleRevision/:id_revision", async function(req, res){
    //upload file untuk revisi
    upload(req, res, async function(err){
        await db.executeQuery(`UPDATE revisi SET directory_file_revisi = '${filename}' WHERE id_revisi = ${req.params.id_revision}`);
        res.status(200).send(filename);
    });
});

router.put("/acceptOrder/:id_transaksi", async function(req, res){
    //update status transaksi menjadi Needs To Be Delivered (2)
    //tentukan tgl accept dan tanggal target penyelesaian
    let tier_detail = await db.executeQuery(`SELECT g.*, t.duration FROM gigs_tier g, transaksi t WHERE  g.id_gigs = t.id_gigs and g.tier_number = t.tier_number and t.id_transaksi = ${req.params.id_transaksi}`);
    let today = new Date();
    let tgl_accept = today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate();
    today.setDate(today.getDate() + tier_detail[0].duration);
    let tgl_target = today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate();
    await db.executeQuery(`UPDATE transaksi SET status_transaksi = 2, tgl_accept = '${tgl_accept}', tgl_target = '${tgl_target}' WHERE id_transaksi = ${req.params.id_transaksi}`);
    let tgl = await db.executeQuery("SELECT to_char(tgl_accept, 'DD Mon YYYY') as tgl_accept, to_char(tgl_target, 'DD Mon YYYY') as tgl_target FROM transaksi WHERE id_transaksi = "+req.params.id_transaksi);
    res.status(200).send({tgl_accept:tgl[0].tgl_accept, tgl_target:tgl[0].tgl_target});
});

router.put("/deliverOrder/:id_transaksi", async function(req, res){
    //upload hasil kerja
    upload(req, res, async function(err){
        let today = new Date();
        let tgl_deliver = today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate();
        await db.executeQuery(`UPDATE transaksi SET status_transaksi = 3, tgl_deliver = '${tgl_deliver}', directory_file = '${filename}' WHERE id_transaksi = ${req.params.id_transaksi}`);
        let tgl = await db.executeQuery("SELECT to_char(tgl_deliver, 'DD Mon YYYY') as tgl_deliver FROM transaksi WHERE id_transaksi = "+req.params.id_transaksi);
        res.status(200).send({tgl_deliver:tgl[0].tgl_deliver, directory_file: filename});
    });
});

router.put("/finishOrder/:id_transaksi", async function(req, res){
    //update status transaksi menjadi Needs To Be Delivered (2)
    //tentukan tgl accept dan tanggal target penyelesaian
    let today = new Date();
    let tgl_selesai = today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate();
    await db.executeQuery(`UPDATE transaksi SET status_transaksi = 4, tgl_selesai = '${tgl_selesai}' WHERE id_transaksi = ${req.params.id_transaksi}`);
    res.status(200).send({tgl_selesai:tgl_selesai});
});

router.post("/createIpaymuLink", async function(req, res){
    //begitu buyer melewati tahap pembayaran, maka tambahkan transaksi ke database
    let formDataString = `{"key":"9A6FC584-43C3-45C7-891E-CB8A2E197362","action":"payment","product[]":${req.body.products},"price[]":${req.body.prices},"quantity[]":${req.body.quantities},"auto_redirect":"60","expired":"24","format":"json","ureturn":"${req.body.ureturn}","unotify":"${req.body.unotify}","buyer_name":"${req.body.buyer_name}","buyer_phone":"${req.body.buyer_phone}","buyer_email":"${req.body.buyer_email}"}`;
    let link = await generateIpaymuLink(JSON.parse(formDataString));
    res.status(200).send(link);
});

router.post("/addIpaymu", async function(req, res){
    //begitu buyer melewati tahap pembayaran, maka tambahkan transaksi ke database
    let sid = req.body.sessionID;
    let id_seller = req.body.id_seller;
    let id_buyer = req.body.id_buyer;
    let id_gigs = req.body.id_gigs;
    let revision = req.body.revision;
    let duration = req.body.duration;
    let tier_number = req.body.tier_number;
    let gigs_quantity = req.body.gigs_quantity;
    let website_fee = req.body.website_fee;
    let extras = req.body.extras;
    let total = req.body.total;

    await db.executeQuery(`INSERT INTO transaksi_ipaymu VALUES('${sid}', ${id_seller}, ${id_buyer}, ${id_gigs}, ${revision}, ${duration}, ${tier_number}, ${gigs_quantity}, ${website_fee}, '${extras}', ${total})`);
    res.status(200).send("Berhasil menambahkan ipaymu transaction");
});

router.post("/afterIpaymu", async function(req, res){
    let response = await db.executeQuery(`SELECT * FROM transaksi_ipaymu WHERE sessionID = '${req.body.sid}'`);
    let today = new Date();
    let tgl_transaksi = today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate();
    await db.executeQuery(`INSERT INTO transaksi(id_seller, id_buyer, id_gigs, revision, revision_left, duration, tier_number, gigs_quantity, website_fee, extras, total, tgl_transaksi, status_transaksi) VALUES(${response[0].id_seller}, ${response[0].id_buyer}, ${response[0].id_gigs}, ${response[0].revision}, ${response[0].revision}, ${response[0].duration}, ${response[0].tier_number}, ${response[0].gigs_quantity}, ${response[0].website_fee}, '${response[0].extras}', ${response[0].total}, '${tgl_transaksi}', 1)`);
    await db.executeQuery(`DELETE FROM transaksi_ipaymu WHERE sessionID = '${req.body.sid}'`);
    res.send(req.body.status);
});

module.exports = router;