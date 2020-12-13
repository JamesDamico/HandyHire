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
    firstName: String,
    lastName: String,
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
    completedJobs: [],
    viewable: Boolean,
    reviews:{
        reviewedAccounts: [],
        yourReviews: [],
        averageRating: Number
    }
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
    res.locals.noneFound = req.flash("noneFound");
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
            res.render("error.ejs");
        }
    });
});

//Logout Route
app.get("/logout", (req, res)=>{
    req.logout();
    res.redirect("/");
});

//Login Post Route
app.post("/login", passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"}), (req, res)=>{
    res.redirect("/settings");
});

//Signup Post Route
app.post("/signup", (req, res)=>{
    User.register({username: req.body.username, email: req.body.email}, req.body.password, function(err, user){
        if(!err){
            passport.authenticate("local")(req, res, function(){
                req.user.state = null;
                req.user.county = null;
                req.user.typeOfWork = null;
                req.user.bio = null;
                req.user.companyName = null;
                req.user.businessEmail = null;
                req.user.phoneNumber = null;
                req.user.save(()=>{
                    res.redirect("/settings");
                });
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

    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const companyName = req.body.companyName;
    const bio = req.body.bio;
    const phoneNumber = req.body.phoneNumber;
    const businessEmail = req.body.businessEmail;
    const typeOfWork = req.body.typeOfWork;
    const county = req.body.county;
    const state = req.body.state;

    req.user.firstName = firstName;
    req.user.lastName = lastName;
    req.user.companyName = companyName;
    req.user.bio = bio;
    req.user.phoneNumber = phoneNumber;
    req.user.businessEmail = businessEmail;
    req.user.typeOfWork = typeOfWork;
    req.user.county = county;
    req.user.state = state;
    
    if(req.user.state != "" && req.user.county != "" && req.user.typeOfWork != "" && req.user.companyName != "" && req.user.phoneNumber != "" 
    && req.user.businessEmail != "" && req.user.bio != ""){
            req.user.viewable = true;
    } else {
        req.user.viewable = false;
    }

    if(req.file){
        if(req.user.profilePicture.filename != null){
            const file = req.user.profilePicture.filename;
            file.replace("HandyHire/", "");
            cloudinary.uploader.destroy(file);
        }
        req.user.profilePicture.url = req.file.path;
        req.user.profilePicture.filename = req.file.filename;
    }

    req.user.save(()=>{
        res.redirect("/settings");
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

//Browse Handymen
app.get("/browse", (req, res)=>{
    res.render("browse.ejs", {
        foundHandyMen: []
    });
});

app.post("/browse", (req, res)=>{
    const fState = req.body.state;
    const fCounty = req.body.county;
    const fTypeOfWork = req.body.typeOfWork;

    User.find({$and: [{state: fState}, {county: fCounty}, {typeOfWork: fTypeOfWork}, {viewable: true}]}, (err, found)=>{
        if(err){
            console.log(err);
        } else {
            if(found.length){
                res.render("browse.ejs", {
                    foundHandyMen: found
                });
            } else {
                req.flash("noneFound", "No " + fTypeOfWork + " Handy Men found in " + fCounty + ", " + fState);
                res.redirect("/browse");
            }

        }     
    });
});

/**
 * Delete Account Post Route
 * When triggered, deletes account and all pictures associated to the account
 */
app.post("/deleteAccount", (req, res)=>{
    const accountConfirmation = req.body.accountDeleteConfirm;
    const condition = "HandyHire.us/" + req.user.username;

    if(accountConfirmation === condition){
        //Delete Profile Picture
        if(req.user.profilePicture.filename != null){
            const file = req.user.profilePicture.filename;
            file.replace("HandyHire/", "");
            cloudinary.uploader.destroy(file);
        }

        //Delete Completed Jobs Pictures
        req.user.completedJobs.forEach(element => {
            if(element.image.filename != null){
                const file = element.image.filename;
                file.replace("HandyHire/", "");
                cloudinary.uploader.destroy(file);
            }
        });

        //Delete User from MongoDB
        User.deleteOne({username: req.user.username}, ()=>{
            res.redirect("/");
        });
    } else {
        res.render("error.ejs");
    }
});

app.post("/submitReview", (req, res)=>{
    const username = req.body.username;
    const review = {
        name: req.user.firstName + " " + req.user.lastName,
        rating: req.body.rating,
        description: req.body.description
    }

    console.log(review.rating);
    console.log(review.description);
    console.log(username);

    User.findOne({username: username}, (err, foundUser)=>{
        if(foundUser){
            foundUser.reviews.yourReviews.push(review);
            
            const numberOfRatings = foundUser.reviews.yourReviews.length;
            let sumOfRatings = 0;
            foundUser.reviews.yourReviews.forEach(element => {
                sumOfRatings += parseInt(element.rating);
            });

            foundUser.reviews.averageRating = sumOfRatings / numberOfRatings;

            foundUser.save(()=>{
                res.redirect("back");
            });
        } else {
            res.render("error.ejs");
        }
    });
});

//Reviews Route
app.get("/reviews", (req, res)=>{
    if(req.isAuthenticated()){
        res.render("reviews.ejs");
    } else {
        res.render("login.ejs");
    }
});

/**
 * Error 404
 * Catches all 404 errors and page not found errors
 */
app.use((req,res) =>{
    res.status(404).render("error.ejs");
});


/**
 * app.listen
 * Sets up a connection on port 3000 or the port assigned by Heroku
 */
app.listen(process.env.PORT || port, ()=>{
    console.log("Server running on port: " + port);
});