const express = require("express");
const router = express.Router();
const db = require('../db_helper');

router.get("/list/:id_user", async function(req, res){
    //dapatkan list request yang telah dibuat oleh seorang user
    var id = req.params.id_user;
    var query = `SELECT * FROM request WHERE id_user = ${id}`;
    var hasil = await db.executeQuery(query);
    res.send(hasil);
});

router.post("/add",async function(req, res){
    //post data-data untuk request baru
    var isi = req.body.isi;
    var skillset = req.body.skillset;
    var batas = req.body.batas_waktu;
    var duration = req.body.duration;
    var budget = req.body.budget;
    var id_user = req.body.id_user;
    var query = `INSERT INTO request VALUES (0,'${isi}','${skillset}',TO_DATE('${batas}','dd/MM/yyyy'), ${duration},${budget},${id_user})`;
    await db.executeQuery(query);
    res.send("Berhasil tambah request!");
});

router.put("/update/:id_req",async function(req, res){
    //post data-data baru untuk request
    var id = req.params.id_req;
    var budget = req.body.budget;
    var skillset = req.body.skillset;
    var duration = req.body.duration;
    var batas_waktu = req.body.batas_waktu;
    var user = req.body.user;
    var qry = `SELECT id_user FROM request WHERE id_req = ${id}`;
    var id_user = await db.executeQuery(qry);
    if(id_user[0] == user){
        var query = "UPDATE request SET ";
        if(budget != ""){
        query = query + `budget = ${budget}`;
        }
        if(skillset != ""){
        if(budget != "") query = query + `, skillset = '${skillset}'`;
        else query = query + `skillset = '${skillset}'`;
        }
        if(duration != ""){
        if(skillset != "") query = query + `, duration = ${duration}`;
        else query = query + `duration = ${duration}`;
        }
        if(batas_waktu != ""){
        if(duration != "") query = query + `, batas_waktu = '${batas_waktu}'`;
        else query = query + `batas_waktu = '${batas_waktu}'`;
        }
        query = query + ` WHERE id_req = ${id}`;
        var hasil = await db.executeQuery(query);
        if(hasil){
        res.send("Berhasil update request");
        }
        else{
        res.status(401).send("Gagal update request!");
        }
    }
    else{
        res.status(401).send("User tidak memiliki hak akses untuk mengupdate request!");
    }
});

router.delete("/delete/:id_req", async function(req, res){
    //delete request dengan id yang diberikan
    var id = req.params.id_req;
    var query = `DELETE FROM request WHERE id_req = ${id}`;
    await db.executeQuery(query);
    res.send("Berhasil hapus request!");
});

module.exports = router;