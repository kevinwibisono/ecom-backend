const express = require("express");
const router = express.Router();
const db = require('../db_helper');
const multer = require('multer');
let filename = '';

const storage=multer.diskStorage({
  destination: './uploads/gigs',
  filename:function(req,file,cb){
    cb(null,file.originalname);
  }
});

const upload=multer({
  storage: storage
}).single('photo');

router.post("/search", async function(req, res){
    //search gigs tertentu
    //bisa menyertakan params seperti query, filter & sort type
    let nama = req.body.nama;
    let category = req.body.category;
    let query = '';
    if(nama != "" && nama != undefined){
      query = `SELECT g.id_gigs, g.judul, g.harga, g.category, g.sub_category, p.directory_file, u.nama, count(r.id_review) as reviews, avg(r.rating) as rating from gigs_pictures p, user_table u, gigs g left join reviews r on (r.id_gigs = g.id_gigs) where g.id_user = u.id_user and p.id_gigs = g.id_gigs and p.number = 1 and LOWER(g.judul) ILIKE '%${nama}%' group by g.id_gigs, u.id_user, u.nama, p.directory_file;`;
    }
    if(category != "" && category != undefined){
      query = `SELECT g.id_gigs, g.judul, g.harga, g.category, g.sub_category, p.directory_file, u.nama, count(r.id_review) as reviews, avg(r.rating) as rating from gigs_pictures p, user_table u, gigs g left join reviews r on (r.id_gigs = g.id_gigs) where g.id_user = u.id_user and p.id_gigs = g.id_gigs and p.number = 1 and g.category = ${category} group by g.id_gigs, u.id_user, u.nama, p.directory_file;`;
    }
    let hasil = await db.executeQuery(query);
    res.send(hasil);
});

router.get("/detail/:id", async function(req, res){
  //mendapatkan detail gigs dengan id tertentu
  //termasuk mendapatkan review, penyedia jasa & faq dengan id gigs tersebut
  //hasil res.send akan mengembalikan object gigs dimana dalamnya terdapat array of reviews + array of faq
  let id_gigs = req.params.id;
  let hasil = await db.executeQuery("SELECT g.*, u.nama FROM gigs g, user_table u WHERE g.id_user = u.id_user and id_gigs = "+id_gigs);
  res.status(200).send(hasil[0]);
});

router.get("/list/:id_user", async function(req, res){
  //mendapatkan daftar gigs milik user tertentu
  let id = req.params.id_user;
  let query = `SELECT g.id_gigs, g.judul, g.harga, g.clicks, g.seen, p.directory_file, u.nama, count(r.id_review) as reviews, avg(r.rating) as rating, count(t.id_gigs) as orders from gigs_pictures p, user_table u, gigs g left join reviews r on (r.id_gigs = g.id_gigs) left join transaksi t on (t.id_gigs = g.id_gigs) where g.id_user = u.id_user and p.id_gigs = g.id_gigs and p.number = 1 and g.id_user = ${id} group by g.id_gigs, u.id_user, u.nama, p.directory_file, g.clicks, g.seen;`;
  let hasil = await db.executeQuery(query);
  res.send(hasil);
});

router.post("/add", async function(req, res){
  //menambahkan gigs baru
  //termasuk menambahkan faq
  let user = req.body.user;
  let harga = req.body.harga;
  let desc = req.body.desc;
  let duration = req.body.duration;
  let category = req.body.category;
  let sub_category = req.body.sub_category;
  let judul = req.body.judul;
  let tier_numbers = req.body.tier_numbers.split('|');
  let tier_prices = req.body.tier_prices.split('|');
  let tier_durations = req.body.tier_durations.split('|');
  let tier_revisions = req.body.tier_revisions.split('|');
  let tier_advantages = req.body.tier_advantages.split('|');
  let extra_names = req.body.extra_names.split('|');
  let extra_prices = req.body.extra_prices.split('|');
  let questions = req.body.questions.split('|');
  let answers = req.body.answers.split('|');

  let query = `INSERT INTO gigs(id_user, harga, judul, description, duration, gigs_status, category, sub_category, clicks, seen) VALUES(${user},${harga},'${judul}','${desc}',${duration},1,'${category}','${sub_category}', 0, 0)`;
  let hasil = await db.executeQuery(query);
  if(hasil){
    let id_gigs = await db.executeQuery('SELECT max(id_gigs) FROM gigs');
    //setelah berhasil insert gigs, kemudian INSERT TIERS
    for (let index = 0; index < 3; index++) {
      await db.executeQuery(`INSERT INTO gigs_tier VALUES(${id_gigs[0].max}, ${tier_numbers[index]}, ${tier_prices[index]}, ${tier_durations[index]}, ${tier_revisions[index]}, '${tier_advantages[index]}')`);
    }

    //kemudian INSERT FAQ
    for (let index = 0; index < questions.length; index++) {
      await db.executeQuery(`INSERT INTO faq VALUES(${id_gigs[0].max}, '${questions[index]}', '${answers[index]}')`);
    }

    //kemudian INSERT EXTRA
    for (let index = 0; index < extra_names.length; index++) {
      if(extra_names[index] != ''){
        await db.executeQuery(`INSERT INTO gigs_extra VALUES(${id_gigs[0].max}, '${extra_names[index]}', ${extra_prices[index]})`);
      }
    }

    //upload PICTURE akan menggunakan ENDPOINT LAIN (/uploadPictures)
    res.status(200).send("Gig added successfully");
  }
  else{
    res.status(401).send('Failed to add gig');
  }
});

router.post("/update/:id_gigs", async function(req, res){
  //menambahkan gigs baru
  //termasuk menambahkan faq
  let harga = req.body.harga;
  let desc = req.body.desc;
  let duration = req.body.duration;
  let category = req.body.category;
  let sub_category = req.body.sub_category;
  let judul = req.body.judul;
  let tier_prices = req.body.tier_prices.split('|');
  let tier_durations = req.body.tier_durations.split('|');
  let tier_revisions = req.body.tier_revisions.split('|');
  let tier_advantages = req.body.tier_advantages.split('|');
  let extra_names = req.body.extra_names.split('|');
  let extra_prices = req.body.extra_prices.split('|');
  let questions = req.body.questions.split('|');
  let answers = req.body.answers.split('|');

  let query = `UPDATE gigs SET harga = ${harga}, description = '${desc}', duration = ${duration}, category = ${category}, sub_category = '${sub_category}', judul = '${judul}' WHERE id_gigs = ${req.params.id_gigs}`;
  let hasil = await db.executeQuery(query);
  if(hasil){
    //setelah berhasil update gigs, kemudian UPDATE KETIGA TIERS
    for (let index = 0; index < 3; index++) {
      await db.executeQuery(`UPDATE gigs_tier SET tier_price = ${tier_prices[index]}, tier_duration = ${tier_durations[index]}, tier_revision = ${tier_revisions[index]}, tier_advantage = '${tier_advantages[index]}' WHERE id_gigs = ${req.params.id_gigs} and tier_number = ${index}`);
    }

    //kemudian RESET FAQ
    await db.executeQuery(`DELETE FROM faq WHERE id_gigs = ${req.params.id_gigs}`);
    for (let index = 0; index < questions.length; index++) {
      await db.executeQuery(`INSERT INTO faq VALUES(${req.params.id_gigs}, '${questions[index]}', '${answers[index]}')`);
    }

    //kemudian RESET EXTRAS
    await db.executeQuery(`DELETE FROM gigs_extra WHERE id_gigs = ${req.params.id_gigs}`);
    for (let index = 0; index < extra_names.length; index++) {
      if(extra_names[index] != ''){
        await db.executeQuery(`INSERT INTO gigs_extra VALUES(${req.params.id_gigs}, '${extra_names[index]}', ${extra_prices[index]})`);
      }
    }

    //reset PICTURE
    await db.executeQuery(`DELETE FROM gigs_pictures WHERE id_gigs = ${req.params.id_gigs}`);
    //upload PICTURE akan menggunakan ENDPOINT LAIN (/uploadPictures)
    res.status(200).send("Gig updated successfully");
  }
  else{
    res.status(401).send('Failed to update gig');
  }
});

router.get('/getTiers/:id', async function(req, res){
  let response = await db.executeQuery(`SELECT * FROM gigs_tier WHERE id_gigs = ${req.params.id} ORDER BY tier_number`);
  res.status(200).send(response);
});

router.get('/getFaq/:id', async function(req, res){
  let response = await db.executeQuery(`SELECT * FROM faq WHERE id_gigs = ${req.params.id}`);
  res.status(200).send(response);
});

router.get('/getPictures/:id', async function(req, res){
  let response = await db.executeQuery(`SELECT * FROM gigs_pictures WHERE id_gigs = ${req.params.id} ORDER BY number`);
  res.status(200).send(response);
});

router.get('/getExtras/:id', async function(req, res){
  let response = await db.executeQuery(`SELECT * FROM gigs_extra WHERE id_gigs = ${req.params.id}`);
  res.status(200).send(response);
});

router.post('/uploadPictures', async function(req, res){
  //karena satu gigs bisa upload hingga 4 gambar, maka endpoint ini dapat diakses hingga 4x sekaligus
  upload(req, res, async function(err){
    let maxID = await db.executeQuery('SELECT max(id_gigs) FROM gigs');
    let id_gigs = maxID[0].max;
    if(req.body.id_gigs){
      id_gigs = req.body.id_gigs;
    }
    let query = '';
    if(req.file){
      query = `INSERT INTO gigs_pictures VALUES(${id_gigs}, ${req.body.number}, '${req.file.originalname}')`;
    }
    if(req.body.filename){
      query = `INSERT INTO gigs_pictures VALUES(${id_gigs}, ${req.body.number}, '${req.body.filename}')`;
    }
    await db.executeQuery(query);
    if(req.body.number == 1){
      let response = await db.executeQuery(`SELECT g.id_gigs, g.judul, g.harga, g.clicks, g.seen, p.directory_file, u.nama, count(r.id_review) as reviews, avg(r.rating) as rating, count(t.id_gigs) as orders from gigs_pictures p, user_table u, gigs g left join reviews r on (r.id_gigs = g.id_gigs) left join transaksi t on (t.id_gigs = g.id_gigs) where g.id_user = u.id_user and p.id_gigs = g.id_gigs and p.number = 1 and g.id_gigs = ${id_gigs} group by g.id_gigs, u.id_user, u.nama, p.directory_file, g.clicks, g.seen;`);
      res.status(200).send(response);
    }
    else{
      res.status(200).send("Gig Picture Added Successfully");
    }
  });
});

router.delete("/delete/:id_gigs",async function(req, res){
  //delete suatu gigs
  let id = req.params.id_gigs;
  let query = `DELETE FROM gigs_pictures WHERE id_gigs = ${id}`;
  await db.executeQuery(query);
  query = `DELETE FROM gigs_tier WHERE id_gigs = ${id}`;
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
  let query = 'SELECT sub_category FROM subcategories';
  if(req.query.category){
    query = `SELECT sub_category FROM subcategories WHERE category = '${req.query.category}'`;
  }
  let result = await db.executeQuery(query);
  res.status(200).send(result);
});

router.post("/addClick", async function(req, res){
  let query = `UPDATE gigs SET clicks = clicks + 1 WHERE id_gigs = ${req.body.id_gigs}`;
  await db.executeQuery(query);
  res.status(200).send('Clicks Updated');
});

router.post("/addSeen", async function(req, res){
  let query = `UPDATE gigs SET seen = seen + 1 WHERE id_gigs = ${req.body.id_gigs}`;
  await db.executeQuery(query);
  res.status(200).send('Seen Updated');
});


module.exports = router;