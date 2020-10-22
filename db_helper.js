const express = require("express");
const router = express.Router();
require('dotenv').config();

const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {rejectUnauthorized: false},
});

async function executeQuery(query){
  return new Promise(function(resolve, reject){
    client.query(query, (err, res) => {
      if(err) reject(err);
      else resolve(res.rows);
    });
  });
}

async function getUser(email) {
  let result = executeQuery(`SELECT * from user_table where email = '${email}'`);
  return result;
}

async function updatePersonalData(email, no_hp, nama, negara, alamat) {
  let result = executeQuery(`UPDATE user_table set 
  no_hp = '${no_hp}', 
  nama = '${nama}', 
  negara = '${negara}', 
  alamat = '${alamat}' 
  where email = '${email}'`);
  return result;
}

async function updateUserOne(email, name, value) {
  let result = executeQuery(`UPDATE user_table set 
  ${name} = '${value}'
  where email = '${email}'`);
  return result;
}

client.connect();

module.exports = {
  "executeQuery" : executeQuery,
  getUser,
  updatePersonalData,
  updateUserOne
}
