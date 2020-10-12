const express = require("express");
const app = express();
const port = 3000;

//Public CSS files
app.use(express.static("public"));

app.get("/", (req, res)=>{
    res.sendFile(__dirname + "/HTML/homePage.html");
});

app.listen(process.env.PORT || port, ()=>{
    console.log("Server running on port: " + port);
});