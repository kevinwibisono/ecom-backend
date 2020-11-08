const express = require("express");
const router = express.Router();
const db = require('../db_helper');
const { body, validationResult } = require('express-validator');

function getDate(){
  let now = new Date();
  return now.getDate()+"/"+(now.getMonth()+1)+"/"+now.getFullYear();
}

router.get("/", async function(req, res){
  let result = {};
  result.status = 401;
  let email = req.query.email || '';
  try {
    if(email != '') 
    {
      let getUser = await db.getUser(email);
      if(getUser.length > 0)
      {
        result.status = 200;
        result.data = getUser;
        // console.log(getUser);
        result.data[0].skillset = getUser[0].skillset.split('|');
      }
      else
      {
        result.msg = "email invalid!";
      }
    }
    else 
    {
      result.msg = "email tidak boleh kosong";
    }
  } catch (error) {
    console.log(error);
    result.msg = error;
  }
  res.status(result.status).send(result);
});

router.post("/register", async function(req, res){
  //post data-data untuk registrasi
  let email = req.body.email;
  let no_hp = req.body.no_hp;
  let nama = req.body.nama;
  let password = req.body.password;
  let alamat = req.body.alamat;
  let negara = req.body.negara;
  if(email == '' || password == '' || no_hp == '' || nama == '' || alamat == '' || negara == ''){
    res.status(400).send('Fields Cannot Be Empty');
  }
  else{
    let emailSearch = await db.executeQuery(`SELECT * FROM user_table WHERE email = '${email}'`);
    if(emailSearch.length <= 0){
      await db.executeQuery(`INSERT INTO user_table (email,no_hp,nama,password,tipe_user,alamat,negara,created_at) VALUES ('${email}','${no_hp}','${nama}','${password}','1','${alamat}','${negara}',TO_DATE('${getDate()}','dd/MM/yyyy'))`);
      let user = await db.executeQuery(`SELECT * FROM user_table WHERE email = '${email}'`);
      res.status(200).send(user);
    }
    else{
      res.status(400).send('Email Is Already Used');
    }
  }
});

router.post("/login", async function(req, res){
    //post email & password, cek login
    let email = req.body.email;
    let password = req.body.password;
    let hasil = await db.executeQuery(`SELECT * FROM user_table WHERE email = '${email}' AND password = '${password}'`);
    if(hasil.length <= 0){
      res.status(401).send("User Not Found!");
    }
    else{
      res.status(201).send(hasil[0]);
    }
});

router.put("/beSeller", async function(req, res){
  //post email & password, cek login
  let id = req.body.id_user;
  let bio = req.body.bio;
  let skillset = req.body.skillset;
  let education = req.body.education;
  if(bio == '' || skillset == '' || education == ''){
    res.status(400).send('You Must At Least Includes Description, 1 Skill and 1 Education');
  }
  else{
    await db.executeQuery(`UPDATE user_table SET bio = '${bio}', skillset = '${skillset}', education = '${education}' WHERE id_user = ${id}`);
    let user = await db.executeQuery(`SELECT * FROM user_table WHERE id_user = ${id}`);
    res.status(201).send(user[0]);
  }
});

router.put("/update/personal",[
  body('no_hp').not().isEmpty().withMessage('field tidak boleh kosong').isMobilePhone().withMessage('nomor telepon tidak valid'),
  body('nama').not().isEmpty().withMessage('field tidak boleh kosong').escape(),
  body('negara').not().isEmpty().withMessage('field tidak boleh kosong').escape(),
  body('alamat').not().isEmpty().withMessage('field tidak boleh kosong').trim().escape(),
], async function(req, res){
  let result = {};
  result.status = 401;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    result.status = 400;
    result.errors = errors.array();
  }
  else
  {
    let email = req.body.email;
    let no_hp = req.body.no_hp;
    let nama = req.body.nama;
    let negara = req.body.negara;
    let alamat = req.body.alamat;
    try {
        let getUser = await db.getUser(email);
        if(getUser.length > 0)
        {
          await db.updatePersonalData(email, no_hp, nama, negara, alamat);
          result.status = 200;
          result.msg = "Data user berhasil diubah!";
        }
        else
        {
          result.errors = [{
            "value": email,
            "msg": "email tidak terdaftar!",
            "param": "email",
            "location": "body"
          }];
        }
    } catch (error) {
      console.log(error);
      result.msg = error;
    }
  }
  res.status(result.status).send(result);
});

router.put("/update/partial",[ //utk update bio, education, skillset
  body('param').not().isEmpty().escape().withMessage('field tidak boleh kosong'),
  body('value').not().isEmpty().escape().withMessage('field tidak boleh kosong'),
], async function(req, res){
  let result = {};
  result.status = 401;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    result.status = 400;
    result.errors = errors.array();
  }
  else
  {
    let email = req.body.email;
    let param = req.body.param;
    let value = req.body.value;
    try {
        let getUser = await db.getUser(email);
        if(getUser.length > 0)
        {
          await db.updateUserOne(email, param, value);
          result.status = 200;
          result.msg = `${param} user berhasil diubah!`;
        }
        else
        {
          result.errors = [{
            "value": email,
            "msg": "email tidak terdaftar!",
            "param": "email",
            "location": "body"
          }];
        }
    } catch (error) {
      console.log(error);
      result.msg = error;
    }
  }
  res.status(result.status).send(result);
});

module.exports = router;