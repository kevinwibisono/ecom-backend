const express = require("express");
const router = express.Router();
const db = require('../db_helper');

router.post("/search", async function(req, res){
    //search gigs tertentu
    //bisa menyertakan params seperti query, filter & sort type
    let nama = req.body.nama;
    let category = req.body.category;
    console.log(category);
    let query = "SELECT * FROM gigs";
    if(nama != "" && nama != undefined){
      query = query + ` WHERE LOWER(judul) ILIKE '%${nama}%'`;
    }
    if(category != "" && category != undefined){
      if(nama != "" && nama != undefined) query = query + ` AND category = ${category}`;
      else query = query + ` WHERE category = ${category}`;
    }
    console.log(query);
    let hasil = await db.executeQuery(query);
    if(hasil.length > 0){
      for (let index = 0; index < hasil.length; index++) {
        query = `SELECT g.id_gigs, u.nama, count(r.id_review) as reviews, avg(r.rating) as rating from user_table u, gigs g left join reviews r on (r.id_gigs = g.id_gigs) where g.id_gigs = ${hasil[index].id_gigs} and g.id_user = u.id_user group by g.id_gigs, u.id_user, u.nama;`;
        let searched_gig = await db.executeQuery(query);
        hasil[index].nama_user = searched_gig[0].nama;
        hasil[index].rating = searched_gig[0].rating;
        hasil[index].reviews = searched_gig[0].reviews;
      }
    }
    res.send(hasil);
});

router.get("/detail/:id", async function(req, res){
  //mendapatkan detail gigs dengan id tertentu
  //termasuk mendapatkan review, penyedia jasa & faq dengan id gigs tersebut
  //hasil res.send akan mengembalikan object gigs dimana dalamnya terdapat array of reviews + array of faq
  let id_gigs = req.params.id;
  let hasil = await db.executeQuery("SELECT * FROM gigs WHERE id_gigs = "+id_gigs);
  res.status(200).send(hasil[0]);
});

router.get("/list/:id_user", async function(req, res){
  //mendapatkan daftar gigs milik user tertentu
  let id = req.params.id_user;
  let query = `SELECT * FROM gigs WHERE id_user = ${id}`;
  let hasil = await db.executeQuery(query);
  res.send(hasil);
});

router.post("/add", async function(req, res){
  //menambahkan gigs baru
  //termasuk menambahkan faq
  let user = req.body.user;
  let harga = req.body.harga;
  let desc = req.body.deskripsi;
  let duration = req.body.duration;
  let category = req.body.category;
  let sub_category = req.body.sub_category;
  let judul = req.body.judul_gigs;
  let query = "";
  if(desc != ""){
    query = `INSERT INTO gigs VALUES(0,${user},${harga},'${desc}',${duration},1,'${category}','${sub_category}','${judul}'))`;
  }
  else{
    query = `INSERT INTO gigs VALUES(0,${user},${harga},'',${duration},1,'${category}','${sub_category}','${judul}')`;
  }
  let hasil = await db.executeQuery(query);
  if(hasil){
    res.send("Gigs Added Successfully");
  }
  else{
    res.status(401).send("Failed To Add Gigs");
  }
});

router.post("/addfaq", async function(req, res){
  let id_gigs = req.body.id_gigs;
  let question = req.body.question;
  let answer = req.body.answer;
  let hasil = await db.executeQuery(`INSERT INTO faq VALUES(0,${id_gigs},'${question}','${answer}')`);
  if(hasil){
    res.send("FAQ Added Successfully");
  }
  else{
    res.status(401).send("Failed To Add FAQ");
  }
});

router.put("/update/:id_gigs", async function(req, res){
  //update gigs dengan data-data baru
  let id = req.params.id_gigs;
  let harga = req.body.harga;
  let desc = req.body.deskripsi;
  let duration = req.body.duration;
  let category = req.body.category;
  let sub_category = req.body.sub_category;
  let user = req.body.user;
  let qry = `SELECT id_user FROM gigs WHERE id_gigs = ${id}`;
  let id_user = await db.executeQuery(qry);
  if(id_user[0] == user){
    let query = "UPDATE gigs SET ";
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
    let hasil = await db.executeQuery(query);
    if(hasil){
      res.send("Berhasil update gigs");
    }
    else{
      res.status(401).send("Failed To Update Gigs");
    }
  }
  else{
    res.status(401).send("You Don't Have Privilege To Update This Gig");
  }
  
});

router.delete("/delete/:id_gigs",async function(req, res){
  //delete suatu gigs
  let id = req.params.id_gigs;
  let query = `DELETE FROM gigs_picture WHERE id_gigs = ${id}`;
  await db.executeQuery(query);
  query = `DELETE FROM faq WHERE id_gigs = ${id}`;
  await db.executeQuery(query);
  query = `DELETE FROM favorit WHERE id_gigs = ${id}`;
  await db.executeQuery(query);
  query = `DELETE FROM reviews WHERE id_gigs = ${id}`;
  await db.executeQuery(query);
  query = `DELETE FROM gigs WHERE id_gigs = ${id}`;
  await db.executeQuery(query);
  res.send("Gigs Deleted Successfully");
});

router.get("/subcategories", async function(req, res){
  let result = await db.executeQuery(`SELECT sub_category FROM subcategories WHERE category = '${req.body.category}'`);
  res.status(200).send(result);
});

module.exports = router;