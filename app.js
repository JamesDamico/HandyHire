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
    email: {
        type: String,
        required: true,
        unique: true
    },
    companyName: String,
    bio: String,
    phoneNumber: String,
    businessEmail: String,
    city: String,
    state: String,
    typeOfWork: String,
    languages: String, //Make an array
    certifications: String, //Make an array
    skills: String //Make an array
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
app.get("/settings", (req, res)=>{
    if(req.isAuthenticated()){
        res.render("settings.ejs");
    } else {
        res.render("login.ejs");
    }
});

//User Profile Route
app.get("/users/:username", (req, res)=>{
    
    User.findOne({username: req.params.username}, (err, foundUser)=>{
        if(foundUser){
            res.render("userProfile.ejs", {
                foundUser: foundUser
            });
        } else {
            res.redirect("/");
        }
    });
});

//Browse Route
app.get("/browse", (req, res)=>{
    res.render("browse.ejs");
});

//Logout Route
app.get("/logout", (req, res)=>{
    req.logout();
    res.redirect("/");
});

//Browse Handymen
app.get("/browse", (req, res)=>{
    res.render("browse.ejs")
});

//Login Post Route
app.post("/login", passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"}), (req, res)=>{
    res.redirect("/");
});

//Signup Post Route
app.post("/signup", (req, res)=>{
    User.register({username: req.body.username, email: req.body.email}, req.body.password, function(err, user){
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

//Settings Post Route
app.post("/settings", (req, res)=>{

    const companyName = req.body.companyName;
    const bio = req.body.bio;
    const phoneNumber = req.body.phoneNumber;
    const businessEmail = req.body.businessEmail;
    const typeOfWork = req.body.typeOfWork;
    const languages = req.body.languages;
    const skills = req.body.skills;
    const certifications = req.body.certifications;
    const city = req.body.city;
    const state = req.body.state;

    User.findById(req.user.id, (err, foundUser)=>{
        if(err){
            console.log(err);
        } else {
            if(foundUser){
                foundUser.companyName = companyName;
                foundUser.bio = bio;
                foundUser.phoneNumber = phoneNumber;
                foundUser.businessEmail = businessEmail;
                foundUser.typeOfWork = typeOfWork;
                foundUser.languages = languages;
                foundUser.skills = skills;
                foundUser.certifications = certifications;
                foundUser.city = city;
                foundUser.state = state;
            
                foundUser.save(()=>{
                    res.redirect("/settings");
                });
            }
        }
    });
});

//Establishing connection to the server
app.listen(process.env.PORT || port, ()=>{
    console.log("Server running on port: " + port);
});