const express = require("express");
const router = express.Router();
const db = require('../db_helper');
const app = express();
const bodyParser = require('body-parser');

app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

router.get("/search", function(req, res){
    //search gigs tertentu
    //bisa menyertakan params seperti query, filter & sort type
    var nama = req.body.nama;
    var category = req.body.category;
    var query = "SELECT * FROM gigs WHERE ";
    if(nama != ""){
      query = ` judul_gigs LIKE '%${nama}%'`;
    }
    if(category != ""){
      if(nama != "") query = query + ` AND category = '${category}'`;
      else `category = '${category}'`;
    }
    var hasil = await db.executeQuery(query);
    res.send(hasil);
});

router.get("/detail/:id", function(req, res){
  //mendapatkan detail gigs dengan id tertentu
  //termasuk mendapatkan review, penyedia jasa & faq dengan id gigs tersebut
  //hasil res.send akan mengembalikan object gigs dimana dalamnya terdapat array of reviews + array of faq

});

router.get("/list/:id_user", async function(req, res){
  //mendapatkan daftar gigs milik user tertentu
  var id = req.params.id_user;
  var query = `SELECT * FROM gigs WHERE id_user = ${id}`;
  var hasil = await db.executeQuery(query);
  res.send(hasil);
});

router.post("/add", async function(req, res){
  //menambahkan gigs baru
  //termasuk menambahkan faq
  var user = req.body.user;
  var harga = req.body.harga;
  var desc = req.body.deskripsi;
  var duration = req.body.duration;
  var category = req.body.category;
  var sub_category = req.body.sub_category;
  var judul = req.body.judul_gigs;
  var query = "";
  if(desc != ""){
    query = `INSERT INTO gigs VALUES(0,${user},${harga},'${desc}',${duration},1,'${category}','${sub_category}','${judul}'))`;
  }
  else{
    query = `INSERT INTO gigs VALUES(0,${user},${harga},'',${duration},1,'${category}','${sub_category}','${judul}')`;
  }
  var hasil = await db.executeQuery(query);
  if(hasil){
    res.send("Berhasil tambah gigs");
  }
  else{
    res.status(401).send("Gagal tambah gigs!");
  }
});

router.post("/addfaq", async function(req, res){
  var id_gigs = req.body.id_gigs;
  var question = req.body.question;
  var answer = req.body.answer;
  var hasil = await db.executeQuery(`INSERT INTO faq VALUES(0,${id_gigs},'${question}','${answer}')`);
  if(hasil){
    res.send("Berhasil tambah FAQ");
  }
  else{
    res.status(401).send("Gagal tambah FAQ");
  }
});

router.put("/update/:id_gigs", async function(req, res){
  //update gigs dengan data-data baru
  var id = req.params.id_gigs;
  var harga = req.body.harga;
  var desc = req.body.deskripsi;
  var duration = req.body.duration;
  var category = req.body.category;
  var sub_category = req.body.sub_category;
  var user = req.body.user;
  var qry = `SELECT id_user FROM gigs WHERE id_gigs = ${id}`;
  var id_user = await db.executeQuery(qry);
  if(id_user[0] == user){
    var query = "UPDATE gigs SET ";
    if(harga != ""){
      query = query + `harga = ${harga}`;
    }
    if(desc != ""){
      if(harga != "") query = query + `, description = '${desc}'`;
      else query = query + `description = '${desc}'`;
    }
    if(duration != ""){
      if(desc != "") query = query + `, duration = ${duration}`;
      else query = query + `duration = ${duration}`;
    }
    if(category != ""){
      if(duration != "") query = query + `, category = '${category}'`;
      else query = query + `category = '${category}'`;
    }
    if(sub_category != ""){
      if(category != "") query = query + `, sub_category = '${sub_category}'`;
      else query = query + `sub_category = '${sub_category}'`;
    }
    query = query + ` WHERE id_gigs = ${id}`;
    var hasil = await db.executeQuery(query);
    if(hasil){
      res.send("Berhasil update gigs");
    }
    else{
      res.status(401).send("Gagal update gigs!");
    }
  }
  else{
    res.status(401).send("User tidak memiliki hak akses untuk mengupdate gigs!");
  }
  
});

router.delete("/delete/:id_gigs",async function(req, res){
  //update gigs dengan data-data baru
  var id = req.params.id_gigs;
  var query = `DELETE FROM gigs_picture WHERE id_gigs = ${id}`;
  await db.executeQuery(query);
  query = `DELETE FROM faq WHERE id_gigs = ${id}`;
  await db.executeQuery(query);
  query = `DELETE FROM favorit WHERE id_gigs = ${id}`;
  await db.executeQuery(query);
  query = `DELETE FROM reviews WHERE id_gigs = ${id}`;
  await db.executeQuery(query);
  query = `DELETE FROM gigs WHERE id_gigs = ${id}`;
  await db.executeQuery(query);
  res.send("Berhasil hapus gigs!");
});

module.exports = router;