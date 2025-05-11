const express = require('express');
const router = express.Router();
const User = require('../User module/userAPI.js');
const user = new User(); // ✅ instantiate class

router.get('/', (req, res) => {
    res.json({ message: 'User route is working!' });
});

router.post('/signup', (req, res) => {
    const { username, userid, userPassword, userEmail, userRole } = req.body;

    user.createUser({ username, userid, userPassword, userEmail, userRole })
        .then(result => {
            res.status(201).json({ message: 'User created' });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ message: 'Error creating user', error: err });
        });
});

// ❓ if loginUser is not in class, comment this
router.post('/login', user.loginUser.bind(user));

module.exports = router;
