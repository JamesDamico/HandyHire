const express = require("express");
const app = express();
const port = 3000;

//Public CSS files
app.use(express.static("public"));

//Home route
app.get("/", (req, res)=>{
    res.sendFile(__dirname + "/HTML/homePage.html");
});


//Establishing connection to the server
app.listen(process.env.PORT || port, ()=>{
    console.log("Server running on port: " + port);
});