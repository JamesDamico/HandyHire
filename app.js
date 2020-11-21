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

//Multure & Cloudinary
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "HandyHire",
        allowedFormats: ["jpeg", "png", "jpg"]
    }
});

const upload = multer({storage});


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
    profilePicture: {
        url: String,
        filename: String
    },
    companyName: String,
    bio: String,
    phoneNumber: String,
    businessEmail: String,
    state: String,
    county: String,
    typeOfWork: String,
    languages: [],
    certifications: [], 
    skills: [], 
    completedJobs: []
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

app.get("/error", (req, res)=>{
    res.render("error.ejs");
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
app.post("/settings", upload.single("image"), (req, res)=>{

    const companyName = req.body.companyName;
    const bio = req.body.bio;
    const phoneNumber = req.body.phoneNumber;
    const businessEmail = req.body.businessEmail;
    const typeOfWork = req.body.typeOfWork;
    const county = req.body.county;
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
                foundUser.county = county;
                foundUser.state = state;

                if(req.file){
                    if(foundUser.profilePicture.filename != null){
                        const file = foundUser.profilePicture.filename;
                        file.replace("HandyHire/", "");
                        cloudinary.uploader.destroy(file);
                    }
                    foundUser.profilePicture.url = req.file.path;
                    foundUser.profilePicture.filename = req.file.filename;
                }

                foundUser.save(()=>{
                    res.redirect("/settings");
                });
            }
        }
    });
});

app.post("/lists", (req, res)=>{
    const item = req.body.newItem;
    const listName = req.body.list;

    if(listName === "languages"){
        req.user.languages.push(item);
        req.user.save(()=>{
            res.redirect("/settings");
        });
    } else if(listName === "skills"){
        req.user.skills.push(item);
        req.user.save(()=>{
            res.redirect("/settings");
        });
    } else if(listName === "certifications"){
        req.user.certifications.push(item);
        req.user.save(()=>{
            res.redirect("/settings");
        });
    }
});

app.post("/deleteLanguage", (req, res)=>{
    const language = req.body.checkbox;

    const index = req.user.languages.indexOf(language);
    req.user.languages.splice(index, 1);
    req.user.save(()=>{
        res.redirect("/settings");
    });
});

app.post("/deleteCertification", (req, res)=>{
    const certification = req.body.checkbox;

    const index = req.user.certifications.indexOf(certification);
    req.user.certifications.splice(index, 1);
    req.user.save(()=>{
        res.redirect("/settings");
    });
});

app.post("/deleteSkill", (req, res)=>{
    const skill = req.body.checkbox;

    const index = req.user.skills.indexOf(skill);
    req.user.skills.splice(index, 1);
    req.user.save(()=>{
        res.redirect("/settings");
    });
});

app.post("/addCompletedJob", upload.single("jobImage"), (req, res)=>{
    let incomingFileName = null;
    let incomingURL = null;

    if(req.file){
        incomingFileName = req.file.filename;
        incomingURL = req.file.path;
    }

    const job = {
        title: req.body.title,
        desc: req.body.description,
        image: {
            filename: incomingFileName,
            url: incomingURL
        }
    }

    req.user.completedJobs.push(job);

    req.user.save(()=>{
        res.redirect("/settings");
    });
    
});

app.post("/deleteCompletedJob", (req, res)=>{

    const index = req.body.index;

    if(req.user.completedJobs[index].image.filename != null){
        const file = req.user.completedJobs[index].image.filename;
        file.replace("HandyHire/", "");
        cloudinary.uploader.destroy(file);
    }
    
    req.user.completedJobs.splice(index, 1);

    req.user.save(()=>{
        res.redirect("/settings");
    });
});

//Establishing connection to the server
app.listen(process.env.PORT || port, ()=>{
    console.log("Server running on port: " + port);
});