import express from 'express';
import { MongoClient } from 'mongodb';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const app = express()
app.use(cors())
app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/login', express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));


// encryption 
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'myUsers';
await client.connect();
console.log('Connected successfully to server');
const db = client.db(dbName);
const collection = db.collection('users');


const port = 3000
app.use(cookieParser())


app.get('/', async (req, res) => {
    const myUsers = await collection.find({}).toArray();
    console.log(myUsers);
    res.send(myUsers);

})
app.post('/', async (req, res) => {
    res.send(req.body);
    bcrypt.hash(req.body.password, 10, async function (err, hash) {
        req.body.password = hash;
        await collection.insertOne(req.body);
    });
})
app.post('/login', async (req, res) => {
    let { email, password } = req.body;
    const myUsers = await collection.find({}).toArray();
    console.log(req.body);
    console.log(email);

    myUsers.forEach(myUser => {
        if (myUser.email == email) {
            console.log(password);
            console.log(myUser.password);
            bcrypt.compare(password, myUser.password, function (err, result) {
                if (result == true) {
                    let token = jwt.sign({ email: myUser.email }, 'neerajsign');
                    res.cookie("token", token);
                    res.send("you are logged-in");
                } else {
                    res.send("Try another credentials");
                }
            });


        }
    });

})
app.get('/check', async (req, res) => {
    if (req.cookies.token) {
        var decoded = jwt.verify(req.cookies.token, 'secret');
        res.send(decoded)
    } else {
        res.send("not logged in");
    }

})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})