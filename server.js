const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const session = require("express-session")
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const { response } = require("express");

const app = express()

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"));
app.use(session({// This just enables us to use the session 
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
  }))
  
app.set("view engine" , "ejs")

 app.use(passport.initialize())
 app.use(passport.session()) 

//This is connecting our website to theat database it will work with. here the first parameter is the address where the db is hosted at
//which is currently at localhost
mongoose.connect("mongodb://localhost:27017/authenticationDB", {useNewUrlParser:true, useUnifiedTopology:true , useCreateIndex:true})

const userSchema =  new mongoose.Schema({
    username:String,
    password:String
})

userSchema.plugin(passportLocalMongoose)

const Users = mongoose.model("user", userSchema)

passport.use(Users.createStrategy())

passport.serializeUser(Users.serializeUser())
passport.deserializeUser(Users.deserializeUser())


app.route("/")
   .get((req,res)=>{
        res.render("home")
   })
   
   app.route("/main")
   .get((req,res)=>{
       if(req.isAuthenticated()==true){
        res.render("main")
       }
       else{
           res.redirect("/login")
       }
       
   })

app.route("/login")
    .get((req,res)=>{
        res.render("login")
    })
    .post((req,res)=>{
        console.log(req.body);

        const user = new Users({
            username: req.body.useremail,
            password: req.body.password
        })
        console.log(user);
        req.login(user,(err)=>{
            if (err) {
                console.log(err);
            }
            else{
                Users.authenticate("local")(req, res, ()=>{
                    res.redirect("/main")
                })
            }
        })
    })

    app.route("/register")
       .get((req,res)=>{
        res.render("register")
       })
       .post((req,res)=>{
           console.log(req.body);
           Users.register({username:req.body.useremail}, req.body.password , (err,user)=>{
               if(err){
                   console.log(err);
               }
               else{
                   console.log(user);
                   res.redirect("/login")
               }
           })
       })
    


app.listen(3000,()=>{
    console.log("Sucessfully hosted the files on port 3000");
})



