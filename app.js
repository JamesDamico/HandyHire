//Express
const express = require("express");
const app = express();
const port = 3000;

//EJS
const ejs = require("ejs");
app.set('view engine', 'ejs');

//Public CSS files
app.use(express.static("public"));

//Home route
app.get("/", (req, res)=>{
    res.render("homePage.ejs");
});

//Edit Profile route
app.get("/editProfile", (req, res)=>{
    res.render("homePage.ejs");
});

//Browse route
app.get("/browse", (req, res)=>{
    res.render("browse.ejs");
});

//Establishing connection to the server
app.listen(process.env.PORT || port, ()=>{
    console.log("Server running on port: " + port);
});

