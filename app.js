var express = require ('express');
var app = express();
var path= require('path');
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport();
var smtpTransport = require('nodemailer-smtp-transport');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var passportLocalMongoose = require('passport-local-mongoose');
var User = require('./models/user');


app.set('port',  process.env.PORT || 3000);
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(express.static(path.join(__dirname, 'public')));
app.set("view engine", "ejs");
app.use(require('express-session')({
  secret: 'Working on enroll Medicare',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect("mongodb://localhost/registration");

//contact form
var contactformSchema = new mongoose.Schema({
  name: String,
  email: String,
  Phno: Number,
  Phno: Number,
  Zip: Number,
  msg: String
});

var Contactform = mongoose.model("Contactform", contactformSchema);

app.post('/contact.html', function(req,res){
//     res.send("Post is working");
    var name = req.body.name;
    var email = req.body.email;
    var phno = req.body.phno;
    var zip = req.body.zip;
    var msg = req.body.msg;
    var newContactform = {name: name, email: email, phno: phno, zip: zip, msg: msg}
    //Create New Contact form and save it to DB
    Contactform.create(newContactform, function(err, newlyCreated){
      if(err){
        console.log(err);
      }else{
                  transporter.sendMail({
                                   from: 'noreply@kcbrag.com',
                                   to: email,
                                   subject: 'Enroll-Medicare',
                                   html: "Contact Test Email Enroll Medicare",
                                   text: 'Test Email from Enroll Medicare'
                                });


//              redirect to Contactform
              res.render("contactformconfirm.ejs", {contact: newContactform});
      }
    });
});


app.post('/registersubmit', function(req,res){
    // res.send("Post is working");
    // var username = req.body.usernameregister;
    // var email = req.body.emailregister;
    // var password1 = req.body.password1register;
    // var password2 = req.body.password2register;
    // var newregisterform = { username:username, email: email, password1: password1, password2: password2}
    console.log("username is "+req.body.username);
    User.register(new User({username: req.body.username, email: req.body.email, password1: req.body.password1}), req.body.password2, function(err, user){
      if(err){
          console.log(err);
          return res.render('error');
        }
        passport.authenticate('local')(req, res, function(){
        res.redirect("secret");
      });
    });
});

//===================
//Routes
//===============
//Show sign up form
// app.get("/login-register.html", function(req, res){
//   res.render("login-register");
// });
app.get("/secret", function(req, res){
  res.render("secret");
});
app.get('/json', function(req,res){
    console.log("GET the json");
    res
        .status(200)
        .json( {"jsonData": true});
});
app.get('/file', function(req,res){
    console.log("GET the file");
    res
        .status(200)
        .sendFile(path.join(__dirname, 'app.js'));
});
var server = app.listen(app.get('port'), function() {
    var port =server.address().port;
    console.log('Magic happens on port ' + port);
});
