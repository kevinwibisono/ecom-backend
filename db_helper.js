const express = require("express");
const router = express.Router();
require('dotenv').config();

const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {rejectUnauthorized: false},
});

function executeQuery(query){
    return new Promise(function(resolve, reject){
      client.query(query, (err, res) => {
        if(err) reject(err);
        else resolve(res.rows);
      });
    });
  }

client.connect();

module.exports = {
  "executeQuery" : executeQuery
}