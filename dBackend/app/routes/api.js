import express from 'express';
import SignupController from '../controllers/signup.js';
import LoginController from '../controllers/login.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.redirect('/home');
})

router.get('/home', (req, res) => {
    res.json({ message: 'Welcome to the home page!'});
})


router.post('/signup', SignupController);
router.post('/login', LoginController);

router.get('/me', auth, (req, res) => {
    res.json({ 'You have successfully logged in': req.userId });
})

export default router;