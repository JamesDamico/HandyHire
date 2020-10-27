//Dotenv
require("dotenv").config();

//Express
const express = require("express");
const app = express();
const port = 3000;

//EJS
const ejs = require("ejs");
app.set('view engine', 'ejs');

//Public CSS files
app.use(express.static("public"));

//Flash
const flash = require("connect-flash");
app.use(flash());

//Body Parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//Mongoose
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGO, 
    {useNewUrlParser: true},
    {useUnifiedTopology: true}
    );

mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Locals
app.use((req, res, next)=>{
    res.locals.user = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

//Home Route
app.get("/", (req, res)=>{
    res.render("homePage.ejs");
});

//Login Route
app.get("/login", (req, res)=>{
    res.render("login.ejs");
});

//Signup Route
app.get("/signup", (req, res)=>{
    res.render("signup.ejs");
});

//Edit Profile Route
app.get("/editProfile", (req, res)=>{
    if(req.isAuthenticated()){
        res.render("editProfile.ejs");
    } else {
        res.render("login.ejs");
    }
});

//User Profile Route
app.get("/userProfile", (req, res)=>{
    res.render("userProfile.ejs");
});

//Browse Route
app.get("/browse", (req, res)=>{
    res.render("browse.ejs");
});

app.get("/logout", (req, res)=>{
    req.logout();
    res.redirect("/");
});

//Login Post Route
app.post("/login", passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"}), (req, res)=>{
    res.redirect("/");
});

//Signup Post Route
app.post("/signup", (req, res)=>{
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if(!err){
            passport.authenticate("local")(req, res, function(){
                res.redirect("/");
            });
        } else {
            console.log(err.message);
            req.flash("error", err.message);
            res.redirect("/signup");
        }
    });
});

//Establishing connection to the server
app.listen(process.env.PORT || port, ()=>{
    console.log("Server running on port: " + port);
});

