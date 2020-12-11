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

async function getUserNama(id_user) {
  let result = await executeQuery(`SELECT nama, jenis_rek, no_rek from user_table where id_user = ${id_user}`);
  return result[0];
}

async function getGigName(id_gigs) {
  let result = await executeQuery(`SELECT judul from gigs where id_gigs = ${id_gigs}`);
  return result[0].judul;
}

async function getAllSeller() {
  let result = await executeQuery(`SELECT id_user, nama, email from user_table where bio != ''`);
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
  (select * from chat_room where id_user = '${id_user2}') as part2
  where part1.id_room = part2.id_room`);
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

async function getReviewsByUser(id_user) {
  let result = await executeQuery(`
  select r.id_review, u.nama, u.photo_dir, r.comment, r.rating, r.created_at, u.negara
  from reviews r, user_table u
  where r.id_reviewer = u.id_user and r.id_user = ${id_user}`);
  return result;
}

async function getReviewsBygig(id_gig) {
  let result = await executeQuery(`
  select r.id_review, u.nama, u.photo_dir, r.comment, r.rating, r.created_at, u.negara
  from reviews r, user_table u
  where r.id_reviewer = u.id_user and r.id_gigs = ${id_gig}`);
  return result;
}

async function addReview(id_user, id_reviewer, id_gigs, rating, comment) {
  console.log({id_user, id_reviewer, id_gigs, rating, comment});
  let result = await executeQuery(`INSERT INTO 
  reviews(id_user, id_reviewer, id_gigs, rating, comment, created_at) 
  values('${id_user}', '${id_reviewer}', '${id_gigs}', '${rating}', '${comment}', now())`);
  return result;
}

async function getAllTrans() {
  let result = await executeQuery(`SELECT id_transaksi,
  id_seller,
  id_buyer,
  id_gigs,
  website_fee,
  total,
  tgl_transaksi,
  status_transaksi,
  tgl_accept,
  tgl_target,
  tgl_deliver,
  tgl_selesai from transaksi`);
  return result;
}

async function konfirmBayar(id_trans) {
  let result = await executeQuery(`UPDATE transaksi set status_transaksi = 5 where id_transaksi = ${id_trans}`);
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
  getChats,
  getAllSeller,
  addReview,
  getReviewsByUser,
  getReviewsBygig,
  getAllTrans,
  getUserNama,
  getGigName,
  konfirmBayar
}
