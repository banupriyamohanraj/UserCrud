const express = require("express");
const cors = require("cors");
require ("dotenv").config();
const { MongoClient} = require('mongodb')
const{ObjectId}= require('mongodb');

const app = express();


//AUTHENTICATION
const authorize = require('./authorize')
// User Authentication Route
const userAuth = require('./userAuth')
//User Information Routes
const user = require('./User')


const port = process.env.PORT || 9000
const dbURL = process.env.DB_URL || 'mongodb://127.0.0.1:27017'

app.use(express.json());
app.use(cors());
app.use("/auth",userAuth)
app.use("/user",user)




//ROUTES
//get all the login info 
app.get("/", async (req, res) => {
    try {
        let client = await MongoClient.connect(dbURL);
        let db = await client.db('user');
        let data = await db.collection("logininfos").find().toArray();
        if (data) {
            console.log(data)
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




//Start Listening to server
app.listen(port,()=>{console.log(`app runs with ${port}`)})