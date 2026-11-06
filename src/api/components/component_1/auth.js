import express from 'express';
import pool from './services/.db.js';
import TokenManager from './validate.js';
const manager = new TokenManager();
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'your_super_secret_key';
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied, token missing' });
    }

    try {
        const verified = jwt.verify(token, SECRET_KEY);
        req.user = verified; 
        next(); // This tells Express to move on to the route handler
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

let testObj = {
  "Token": "9",
  "name": "John Doe",
  "text": "hi how are you",
  "message" : "I need vactions"
};

const app = express();
app.use(express.json());

//endpoints
app.post('/encryptsend', async (req, res) => {
    try {
        if (typeof manager.Validate === 'function' ? manager.Validate() : manager.Validate) {
            const encrypted = manager.encryptData(testObj.text);
            res.send(encrypted);
        } else {
            res.status(403).send({ error: 'Validation failed' });
        }
    } catch (error) {
        res.status(500).send({ error: 'Encryption failed' });
    }
});

app.post('/decryptrec', async (req, res) => {
    try {
        let message = manager.decryptData(req.body);
        res.send(message);
    } catch (error) {
        res.status(400).send({ error: 'Decryption failed' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const isValid = manager.Validate(req.body);
        console.log("DID IT VALIDATE?:", isValid);

        if (isValid==true) {
            manager.AssignToken()
        } else {
            res.status(401).send({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error("Login Error Stack:", error); 
        res.status(500).send({ error: error.message || 'Internal server error' });
    }
});

app.post('/validateToken' , authenticateToken , async(req,res) => {
    console.log("hello");
    try {
        const isValid = manager.Validate(req.body);
        console.log("DID IT VALIDATE?:", isValid);
        

        if (isValid==true) {
            res.status(200).send({success:'logged in as user'});
            
        } else {
            res.status(401).send({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error("Login Error Stack:", error); 
        res.status(500).send({ error: error.message || 'Internal server error' });
    }

});
const PORT = process.env.PORT || 3007;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});