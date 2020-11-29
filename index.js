const express = require("express");
const path = require("path");
require('dotenv').config();
const user = require("./routes/user");
const cors = require("cors");
const gigs = require("./routes/gigs");
const request = require("./routes/request");
const transaksi = require("./routes/transaksi");
const revisi = require("./routes/revisi");
const chat = require("./routes/chat");
const favorit = require("./routes/favorit");
const mailer = require("./routes/mailer");
const app = express();
app.use(express.static('./uploads'))

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use("/user", user);
app.use("/gigs", gigs);
app.use("/request", request);
app.use("/transaksi", transaksi);
app.use("/revisi", revisi);
app.use("/chat", chat);
app.use("/favorit", favorit);
app.use("/mail", mailer);

app.use(express.static(__dirname+'/uploads'));
app.get("/", function(req, res){
    //masuk halaman login/register
    res.status(200).send("Ini halaman awal");
});

app.listen(process.env.PORT, function(){
    console.log("Listening to port "+ process.env.PORT);
});