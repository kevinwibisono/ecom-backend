const express = require("express");
const router = express.Router();
const db = require('../db_helper');
const { body, validationResult } = require('express-validator');

router.get("/list/:id_user", async function(req, res){
    //dapatkan list request yang telah dibuat oleh seorang user
    let id = req.params.id_user;
    let query = `SELECT * FROM request WHERE id_user = ${id}`;
    let hasil = await db.executeQuery(query);
    res.send(hasil);
});

router.post("/add", async function(req, res){
    // console.log(req.body);
    //post data-data untuk request baru
    let isi = req.body.isi.toString();
    let category = req.body.category;
    let batas = new Date(req.body.batas_waktu).getDate() + "/" + new Date(req.body.batas_waktu).getMonth() + "/" + new Date(req.body.batas_waktu).getFullYear();
    let duration = req.body.duration;
    let budget = req.body.budget;
    let id_user = req.body.id_user;
    if(isi == "" || category == -1 || batas == "" || duration == 0 || budget == 0){
        res.status(400).send("Field tidak boleh kosong");
    }
    else if(isi.includes(`"`) || isi.includes(`'`)){
        res.status(400).send(`Deskripsi tidak boleh mengandung tanda petik (" atau ')`);
    }
    else{
        let query = `INSERT INTO request (isi_req, category, batas_waktu, duration, budget, id_user) VALUES ('${isi}',${category},TO_DATE('${batas}','dd/MM/yyyy'), ${duration}, ${budget}, ${id_user})`;
        await db.executeQuery(query);
        let req = await db.executeQuery(`SELECT * FROM request WHERE id_req IN (SELECT max(id_req) FROM request)`);
        res.status(200).send(req);
    }
});

router.put("/update/:id_req",async function(req, res){
    //post data-data baru untuk request
    let id = req.params.id_req;
    let budget = req.body.budget;
    let skillset = req.body.skillset;
    let duration = req.body.duration;
    let batas_waktu = req.body.batas_waktu;
    let user = req.body.user;
    let qry = `SELECT id_user FROM request WHERE id_req = ${id}`;
    let id_user = await db.executeQuery(qry);
    if(id_user[0] == user){
        let query = "UPDATE request SET ";
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
        let hasil = await db.executeQuery(query);
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
    let id = req.params.id_req;
    let query = `DELETE FROM request WHERE id_req = ${id}`;
    await db.executeQuery(query);
    res.send("Berhasil hapus request!");
});

module.exports = router;