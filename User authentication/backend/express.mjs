import express from 'express';
import { MongoClient } from 'mongodb';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { name } from 'ejs';

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
const Users = db.collection('users');
const posts = db.collection('posts');


const port = 3000
app.use(cookieParser())
app.set('view engine', 'ejs');


app.get('/', isLoggedOut, async (req, res) => {
    res.render('signup');
})
app.post('/', async (req, res) => {
    console.log(req.body);

    let userExist = false;
    const myUsers = await Users.find({}).toArray();
    myUsers.forEach(user => {
        if (user.email === req.body.email) {
            userExist = true;
        }
    });
    if (userExist === false) {
        console.log(`inserting one based on ${userExist}`);
        bcrypt.hash(req.body.password, 10, async function (err, hash) {
            req.body.password = hash;
            await Users.insertOne(req.body);
        });
        res.redirect('/login');
    } else if (userExist === true) {
        res.send("User with this Email already exist.")
    }

})
app.post('/login', async (req, res) => {
    let { email, password } = req.body;
    const myUsers = await Users.find({}).toArray();
    let userFound = false;
    myUsers.forEach(myUser => {
        if (myUser.email === email) {
            userFound = true;
            bcrypt.compare(password, myUser.password, function (err, result) {
                if (result) {
                    let token = jwt.sign({ email: myUser.email, name: myUser.name }, 'neerajsign');
                    res.cookie('token', token);
                    return res.redirect('/dashboard');
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
    if (req.cookies.token && req.cookies.token !== "") {
        res.redirect('/dashboard')
    } else {
        const staticFile = path.join(__dirname, 'public', 'index.html');
        res.sendFile(staticFile);
    }
})
app.get('/logout', async (req, res) => {
    res.cookie("token", "");
    res.redirect('/login')
})
app.get('/dashboard', isLoggedIn, async (req, res) => {
    let letter = req.name.toUpperCase();
    let firstLetter = letter.indexOf(" ");
    res.render('dashboard', {
        avatarName: letter.charAt(0) + "" + letter.charAt(firstLetter + 1),
        useName: req.name
    });
})

app.post('/post', async (req, res) => {
    posts.insertOne(req.body);
    res.send(`post created with title ${req.body.post}` )
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

function isLoggedOut(req, res, next) {
    if (req.cookies.token || req.cookies.token !== "") {
        res.redirect('/dashboard')
    } else {
        next();
    }
}


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})