import UserBeanImpl from '../models/users/UserBeanImpl.js';

export default function SignupController(req, res) {
    let { username, userId, userPassword, userEmail, userRole } = req.body;

    if (!username || !userId || !userPassword || !userEmail ) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    
    const user = UserBeanImpl.getUser(userId);

    if (user) {
        return res.status(400).json({ message: 'User already exists' });
    }

    if (userRole !== true) {
        userRole = false;
    }

    UserBeanImpl.createUser(username, userId, userPassword, userEmail, userRole);
    res.json({message: 'User created successfully'});
}

