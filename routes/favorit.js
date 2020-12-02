const express = require("express");
const router = express.Router();
const db = require('../db_helper');

router.get("/list/:id_user",async function(req, res){
  //mendapatkan daftar gigs favorit milik user tertentu
  let gigs = [];
  let id = req.params.id_user;
  let query = `SELECT * FROM favorit WHERE id_user = ${id}`;
  let hasil = await db.executeQuery(query);
  console.log(hasil);
  if(hasil.length > 0){
    for (let index = 0; index < hasil.length; index++) {
      let gig = {};
      gig.id_gigs = hasil[index].id_gigs;
      let query = `SELECT g.judul, g.harga, g.description, g.category, g.sub_category, u.nama, count(r.id_review) as reviews, avg(r.rating) as rating, p.directory_file from gigs_pictures p, user_table u, gigs g left join reviews r on (r.id_gigs = g.id_gigs) where g.id_gigs = ${hasil[index].id_gigs} and g.id_user = u.id_user and g.id_gigs = p.id_gigs and p.number = 1 group by g.judul, g.harga, g.description, g.category, g.sub_category, u.nama, p.directory_file;`;
      let searched_gig = await db.executeQuery(query);
      gig.judul = searched_gig[0].judul;
      gig.harga = searched_gig[0].harga;
      gig.category = searched_gig[0].category;
      gig.sub_category = searched_gig[0].sub_category;
      gig.nama_user = searched_gig[0].nama;
      gig.reviews = searched_gig[0].reviews;
      gig.rating = searched_gig[0].rating;
      gig.directory_file = searched_gig[0].directory_file;
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
  let gigs = req.body.gigs;
  let user = req.body.user;
  let query = `INSERT INTO favorit VALUES(${gigs},${user})`;
  await db.executeQuery(query);
  res.send("Berhasil memfavorit kan gigs!");
});

router.delete("/delete/:id_gigs/:id_user",async function(req, res){
  //hapus item dari favorit
  let id = req.params.id_gigs;
  let user = req.params.id_user;
  let query = `DELETE FROM favorit WHERE id_gigs = ${id} AND id_user = ${user}`;
  await db.executeQuery(query);
  res.send("Berhasil unfavorite gigs!");
});

module.exports = router;