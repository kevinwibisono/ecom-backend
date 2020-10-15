const express = require("express");
const router = express.Router();
const db = require('../db_helper');
const app = express();
const bodyParser = require('body-parser');

app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

router.get("/list/:id_user",async function(req, res){
  //mendapatkan daftar gigs favorit milik user tertentu
  var id = req.params.id_user;
  var query = `SELECT * FROM favorit WHERE id_user = ${id}`;
  var hasil = await db.executeQuery(query);
  res.send(hasil);
});

router.post("/add",async function(req, res){
  //menambahkan gigs ke dalam daftar favorit
  var gigs = req.body.gigs;
  var user = req.body.user;
  var query = `INSERT INTO favorit VALUES(${gigs},${user})`;
  await db.executeQuery(query);
  res.send("Berhasil memfavorit kan gigs!");
});

router.delete("/delete/:id_gigs/:id_user",async function(req, res){
  //hapus item dari favorit
  var id = req.params.id_gigs;
  var user = req.params.id_user;
  var query = `DELETE FROM favorit WHERE id_gigs = ${id} AND id_user = ${user}`;
  await db.executeQuery(query);
  res.send("Berhasil unfavorite gigs!");
});

module.exports = router;