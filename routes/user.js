const express = require("express");
const router = express.Router();
const db = require('../db_helper');
const app = express();
const bodyParser = require('body-parser');

app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function getDate(){
  let now = new Date();
  return now.getDate()+"/"+(now.getMonth()+1)+"/"+now.getFullYear();
}

router.post("/register", async function(req, res){
  //post data-data untuk registrasi
  var email = req.body.email;
  var no_hp = req.body.no_hp;
  var nama = req.body.nama;
  var password = req.body.password;
  var alamat = req.body.alamat;
  var negara = req.body.negara;
  var hasil = await db.executeQuery(`INSERT INTO user_table (email,no_hp,nama,password,tipe_user,alamat,negara,created_at) VALUES ('${email}','${no_hp}','${nama}','${password}','1','${alamat}','${negara}',TO_DATE('${getDate()}','dd/MM/yyyy'))`);
  if(hasil){
    res.send("Berhasil tambah user");
  }
  else{
    res.status(401).send("Gagal tambah user");
  }
});

router.post("/login", async function(req, res){
    //post email & password, cek login
    var email = req.body.email;
    var password = req.body.password;
    let hasil = await db.executeQuery(`SELECT * FROM user_table WHERE email = '${email}' AND password = '${password}'`);
    if(hasil.length <= 0){
      res.status(401).send("User tidak ditemukan!");
    }
    else{
      res.status(201).send(hasil[0].id_user);
    }
});

router.put("/update", function(req, res){
  //post data-data baru dari update profile
  
});

module.exports = router;