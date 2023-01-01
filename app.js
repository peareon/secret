//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});
mongoose.set('strictQuery', 'false');


const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = mongoose.model("user", userSchema);

app.get("/", function(req, res){
    res.render("home");
});


app.route("/login")
    .get(
        function(req, res){
            res.render("login")
        }
    )
    .post(function(req, res){

        email = req.body.username.toLowerCase();
        password = req.body.password;
    
        User.find({email: email}, function(err, userFound){
            if(!err){
                if(userFound[0]){
                    if(userFound[0].password === password){
                        console.log("User sucessfully found!", userFound)
                        res.render("secrets")
                    }else{
                        console.log("Password incorrect!")
                    }
                    
                }else{
                    console.log("User does not exist");
                }
            }else{
                console.log(err);
            }
        })
    });



app.route("/register")
    .get(function(req, res){
        res.render("register");
    })
    .post(function(req, res){

        email = req.body.username.toLowerCase();
        password = req.body.password;
        console.log(email, password)

        User.find({email: email}, function(err, userFound){
            
            if(!err){
                if(!userFound[0]){
                    console.log("User didn't exist. Adding to db")
                    const newUser = new User({email: email, password: password});
                    newUser.save(function(err){
                        if(err){
                            console.log(err);
                        }else{
                            console.log("redirecting")
                            res.render("secrets");
                        }
                    });
                }else{
                    console.log("redirecting")
                    res.render("secrets");
                }
            }else{
                console.log(err);
            }
        })
    
    });



app.get("/submit", function(req, res){
    res.render("submit");
}); 


app.listen(3000, function(){
    console.log("Server started on port 3000")
})