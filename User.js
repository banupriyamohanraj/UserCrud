require ("dotenv").config();
const router = require('express').Router();
const { MongoClient, ObjectID} = require('mongodb')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
var jwt = require('jsonwebtoken')
const crypto = require('crypto');
NODE_TLS_REJECT_UNAUTHORIZED='0'

//DB connection

const dbURL = process.env.DB_URL || 'mongodb://localhost:27017'


//nodemailer
const transporter = nodemailer.createTransport({
    service:"gmail",
    port: 465,
    secure: true,  
    auth: {
      type: 'OAuth2',
      user: process.env.NODEMAILER_ACC,
      pass: process.env.NODEMAILER_PASS,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      accessToken:process.env.ACCESS_TOKEN,
      refreshToken: process.env.REFRESH_TOKEN
    }
    
  });

  transporter.set("oauth2_provision_cb", (user, renew, callback) => {
    let accessToken = userTokens[user];
    if (!accessToken) {
      return callback(new Error("Unknown user"));
    } else {
      return callback(null, accessToken);
    }
  });
  

//request validation
const userSchema = require('./validateSchema')


//create a user

router.post("/addUser", async (req, res) => {

    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let email = req.body.email;
    let password = req.body.password;
    let phone = req.body.phone;
   


    try {
        let client = await MongoClient.connect(dbURL,{useNewUrlParser: true, useUnifiedTopology: true});
        let db = await client.db('user');
        let data = await db.collection("logininfos").findOne({ email: email, password: password })
        let result = userSchema.validateAsync(req.body)
        console.log(result)
        if(result){
            if (!data) {
                let salt = await bcrypt.genSalt(10)
                let hash = await bcrypt.hash(req.body.password, salt)
                req.body.password = hash
                console.log(req.body)
                crypto.randomBytes(32,(err,buffer)=>{
                    if(err){
                        console.log(err)
                    }else{
                        const confirmationcode = buffer.toString("hex")
                        req.body.code = confirmationcode
                      if(firstname&&lastname&&email&&password&&phone){
                        db.collection('logininfos').insertOne(req.body)
                      }
                     
                 
                var mailOptions = {
                    from: process.env.NODEMAILER_ACC,
                    to:  req.body.email,
                    subject: "Email Confirmation",
                    html: `<h2>Hello</h2>
                    <p>Thank you for subscribing. Please confirm your email with this token ${confirmationcode}</p>
                    `
                }
               
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error)
                    } else {
                        console.log("email sent " + info.response)
                    }
                   
                })
                res.status(200).json({ message: "user successfully registered" })
                    }
                })
               
            } else{
                res.send('user already exists')
            }
        }
        

            
        }
        // client.close();
     catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })

    }

})

//delete a user
router.delete('/deleteUser/:userId', async (req, res) => {
    try {
        let client = await MongoClient.connect(dbURL);
        let db = await client.db('login');
        let data = await db.collection("logininfos").deleteOne({ _id :ObjectID(req.params.userId)})
        console.log(data)
            if(data){
                res.status(200).json({message:"user deleted"})
            }
            else {
                res.status(404).json({ message: "user not found" })
            }  
            client.close();
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }

})

//read all the USERS
router.get("/users", async (req, res) => {
    try {
        let client = await MongoClient.connect(dbURL);
        let db = await client.db('user');
        let data = await db.collection("logininfos").find().toArray();
        if (data) {
            
            res.status(200).json(data)
        } else {
            res.status(404).json({ message: "no data found" })
        }
        client.close();
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }
})

//read a user

router.get("/userdata", async (req, res) => {
    try {
        let client = await MongoClient.connect(dbURL);
        let db = await client.db('user');
        let data = await db.collection("logininfos").findOne({ email: req.body.email});
        if (data) {
            
            res.status(200).json(data)
        } else {
            res.status(404).json({ message: "no data found" })
        }
        client.close();
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }
})

//update a user
router.post('/update',async (req,res)=>{
    try {
        const newpassword = req.body.password;
        const sentToken = req.body.token;
    
        let client = await MongoClient.connect(dbURL);
            let db = await client.db('user');
            let data = await db.collection("logininfos").findOne({ _id :ObjectID(req.params.userId)})
            if(!data){
                res.status(401).json({message : "Invalid User Id"})
            }else{
                await db.collection('logininfos').updateOne({ _id :ObjectID(req.params.userId)},{$set:{email:req.body.email,password:req.body.password}})
                res.status(200).json({ message: "User Updated Successfully" })
            }
            client.close();
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal Server error"})
    }
   
})

module.exports = router;