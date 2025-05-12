import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import UserBeanImpl from '../models/users/UserBeanImpl.js';
import bcrypt from 'bcrypt';
const JWTSECRETKEY = 'IamBatman';
dotenv.config();


export default function LoginController(req, res) {
    const { userId, userPassword } = req.body;
    
    if (!userId || !userPassword) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const user = UserBeanImpl.getUser(userId);

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = bcrypt.compareSync(userPassword, user.userPassword);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials'});
    }

    const token = jwt.sign({ userId: user.userId }, JWTSECRETKEY);
    console.log(token);
    return res.status(200).json({ token });
}