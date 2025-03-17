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
app.set('view engine', 'ejs');


app.get('/', async (req, res) => {
    res.render('signup');
})
app.post('/', async (req, res) => {
    let userExist = false;
    const myUsers = await collection.find({}).toArray();
    myUsers.forEach(user => {
        console.log("in foreach");
        if (user.email === req.email) {
            userExist = true;
            console.log("in foreach if");
        }
    });
    if (userExist === true) {
        bcrypt.hash(req.body.password, 10, async function (err, hash) {
            req.body.password = hash;
            await collection.insertOne(req.body);
        });
        res.send(req.body);
    } else if (userExist === false) {
        res.send("User with this Email already exist.")

    }

})
app.post('/login', async (req, res) => {
    let { email, password } = req.body;
    const myUsers = await collection.find({}).toArray();
    let userFound = false;
    myUsers.forEach(myUser => {
        if (myUser.email === email) {
            userFound = true;
            bcrypt.compare(password, myUser.password, function (err, result) {
                if (result) {
                    let token = jwt.sign({ email: myUser.email, name: myUser.name }, 'neerajsign');
                    res.cookie('token', token);
                    return res.redirect('/profile');
                } else {
                    return res.send("Try another password");
                }
            });
        }
    });
    if (!userFound) {
        return res.send("Try another mail");
    }
})
app.get('/login', async (req, res) => {
    if (req.cookies.token !== "") {
        res.redirect('/profile')
    } else {
        const staticFile = path.join(__dirname, 'public', 'index.html');
        res.sendFile(staticFile);
    }
})
app.get('/logout', async (req, res) => {
    res.cookie("token", "");
    res.redirect('/login')
})
app.get('/profile', isLoggedIn, async (req, res) => {
    res.send(`Welcome ${req.name}`)
})

// middleware 

function isLoggedIn(req, res, next) {
    if (req.cookies.token) {
        jwt.verify(req.cookies.token, 'neerajsign', function (err, decoded) {
            req.name = decoded.name;
        });
        next();
    } else {
        res.redirect('/login');
    }
}


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})