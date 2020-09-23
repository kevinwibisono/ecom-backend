const express = require("express");
const buyer = require("./routes/buyer");
const seller = require("./routes/seller");
const app = express();

app.use(express.json());
app.use("/buyer", buyer);
app.use("/seller", seller);

app.get("/", function(){
    //masuk halaman login/register
    
});

app.listen(3000, function(){
    console.log("Listening to port 3000");
});