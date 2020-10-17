const express = require("express");
const router = express.Router();
const db = require('../db_helper');

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
  if(email == '' || password == '' || no_hp == '' || nama == '' || alamat == '' || negara == ''){
    res.status(400).send('Field-field tidak boleh kosong');
  }
  else{
    var emailSearch = await db.executeQuery(`SELECT * FROM user_table WHERE email = '${email}'`);
    if(emailSearch.length <= 0){
      await db.executeQuery(`INSERT INTO user_table (email,no_hp,nama,password,tipe_user,alamat,negara,created_at) VALUES ('${email}','${no_hp}','${nama}','${password}','1','${alamat}','${negara}',TO_DATE('${getDate()}','dd/MM/yyyy'))`);
      var user = await db.executeQuery(`SELECT * FROM user_table WHERE email = '${email}'`);
      res.status(200).send(user);
    }
    else{
      res.status(400).send('Email Is Already Used');
    }
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
      res.status(201).send(hasil[0]);
    }
});

router.put("/update", function(req, res){
  //post data-data baru dari update profile
  
});

module.exports = router;