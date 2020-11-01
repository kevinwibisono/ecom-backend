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
  let result = await executeQuery(`SELECT * from user_table where email = '${email}'`);
  return result;
}

async function updatePersonalData(email, no_hp, nama, negara, alamat) {
  let result = await executeQuery(`UPDATE user_table set 
  no_hp = '${no_hp}', 
  nama = '${nama}', 
  negara = '${negara}', 
  alamat = '${alamat}' 
  where email = '${email}'`);
  return result;
}

async function updateUserOne(email, name, value) {
  let result = await executeQuery(`UPDATE user_table set 
  ${name} = '${value}'
  where email = '${email}'`);
  return result;
}

async function getContacts(id_user) {
  let result = await executeQuery(`
  select cr.id_room, cr.id_user, u.nama
  from chat_room cr, user_table u
  where id_room in (
    select id_room
    from chat_room
    where id_user = '${id_user}'
  ) and cr.id_user != '${id_user}' and u.id_user = cr.id_user`);
  return result;
}

async function postMessage(id_user, message, id_room) {
  let result = await executeQuery(`INSERT INTO chat(id_user, "timestamp", message, id_room)
	VALUES (${id_user}, now(), '${message}', '${id_room}')`);
  return result;
}

async function checkRoom(id_user1, id_user2) {
  let result = await executeQuery(`select *
  from 
  (select * from chat_room where id_user = '${id_user1}') as part1,
  (select * from chat_room where id_user = '${id_user2}') as part2`);
  return result;
}

async function createRoom(ID, id_user) {
  await executeQuery(`INSERT INTO chat_room(id_room, id_user) VALUES ('${ID}','${id_user}')`);
  return ID;
}

async function getChats(id_room) {
  let result = await executeQuery(`select * from chat where id_room = '${id_room}'`);
  return result;
}

client.connect();

module.exports = {
  "executeQuery" : executeQuery,
  getUser,
  updatePersonalData,
  updateUserOne,
  getContacts,
  postMessage,
  checkRoom,
  createRoom,
  getChats
}
