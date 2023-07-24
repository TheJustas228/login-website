const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database(':memory:');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '.')));

db.serialize(() => {
    db.run('CREATE TABLE users (username TEXT, password TEXT)');
});

app.post('/create-user', (req, res) => {
    const { username, password } = req.body;
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            db.all('SELECT * FROM users', [], (err, rows) => {
                if (err) {
                    throw err;
                }
                console.log(rows);
            });
            res.redirect('/login.html');
        }
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (row) {
            res.json({ message: 'Login successful' });
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});