const express = require("express");
const router = express.Router();
const db = require('../db_helper');

router.get("/list/:id_user",async function(req, res){
  //mendapatkan daftar gigs favorit milik user tertentu
  var gigs = [];
  var id = req.params.id_user;
  var query = `SELECT * FROM favorit WHERE id_user = ${id}`;
  var hasil = await db.executeQuery(query);
  console.log(hasil.length);
  if(hasil.length > 0){
    for (let index = 0; index < hasil.length; index++) {
      console.log(hasil[index]);
      var gig = {};
      gig.id_gigs = hasil[index].id_gigs;
      query = `SELECT g.judul, g.harga, g.description, g.category, g.sub_category, count(r.id_review) as reviews, avg(r.rating) as rating from gigs g left join reviews r on (r.id_gigs = g.id_gigs) where g.id_gigs = ${hasil[index].id_gigs} group by g.judul, g.harga, g.description, g.category, g.sub_category;`;
      var searched_gig = await db.executeQuery(query);
      gig.gigs_name = searched_gig[0].judul;
      gig.price = searched_gig[0].harga;
      gig.gigs_desc = searched_gig[0].description;
      gig.category = searched_gig[0].category;
      gig.sub_category = searched_gig[0].sub_category;
      gig.reviews = searched_gig[0].reviews;
      gig.rating = searched_gig[0].rating;
      gigs.push(gig);
    }
    res.send(gigs);
  }
  else{
    res.send(gigs);
  }
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