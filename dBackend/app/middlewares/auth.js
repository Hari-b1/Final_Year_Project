import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import UserBeanImpl from '../models/users/UserBeanImpl.js';
const JWTSECRETKEY = 'IamBatman';
dotenv.config();

export default function auth(req, res, next) {
    console.log('auth middleware');
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, JWTSECRETKEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.userId = decoded.userId;
        if (!UserBeanImpl.getUser(req.userId)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        next();
    });
}