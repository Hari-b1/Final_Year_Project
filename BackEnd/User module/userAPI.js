const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const UserBean = require('./userBean');
const saltRounds = 10;

class User extends UserBean {
    constructor() {
        super();
        // this.mongoUrl = 'mongodb+srv://Cluster41275:XVlyYlZiSG9z@cluster41275.ioiqt7s.mongodb.net/VideoStreamDB?retryWrites=true&w=majority&appName=Cluster41275';
        this.mongoUrl = 'mongodb+srv://Cluster41275:XVlyYlZiSG9z@cluster41275.ioiqt7s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster41275'
        this.dbName = 'VideoStreamDB';
    }

    async connect() {
        const client = await MongoClient.connect(this.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
        if (!client) {
            throw new Error('Failed to connect to the database');
            console.log('Failed to connnect to the database');
        } else {
            console.log('connected to the database');
            console.log(client);
        }
        return client;
    }

    async getUserDetails(userId) {
        const client = await this.connect();
        const db = client.db(this.dbName);
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        client.close();
        if (!user) throw new Error('User not found');
        return user;
    }

    async createUser(userData) {
        const client = await this.connect();
        const db = client.db(this.dbName);
        const hashedPassword = await bcrypt.hash(userData.userPassword, saltRounds);

        const newUser = {
            username: userData.username,
            userId: userData.userid,
            userPassword: hashedPassword,
            userEmail: userData.userEmail,
            userRole: userData.userRole || false // default role
        };

        const result = await db.collection('users').insertOne(newUser);
        client.close();
        return result;
    }


    async loginUser(req, res) {
        const { userId, password } = req.body;
    
        if (!userId || !password) {
            return res.status(400).json({ message: 'Missing credentials' });
        }
    
        try {
            const client = await MongoClient.connect(this.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
            const db = client.db(this.dbName);
            const user = await db.collection('users').findOne({ userId: userId });
            client.close();
    
            if (!user) return res.status(401).json({ message: 'User not found' });
    
            const isMatch = await bcrypt.compare(password, user.userPassword);
            if (!isMatch) return res.status(401).json({ message: 'Invalid password' });
    
            const token = jwt.sign({ id: user._id, role: user.userRole }, jwtSecret, { expiresIn: '2h' });
    
            res.status(200).json({
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.userEmail,
                    role: user.userRole
                }
            });
        } catch (err) {
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    }    

    async isUserStreamer(userId) {
        try {
            const user = await this.getUserDetails(userId);
            return user.userRole === 'streamer';
        } catch (err) {
            return false;
        }
    }

    async isExistingUser(userId) {
        const client = await this.connect();
        const db = client.db(this.dbName);
        const user = await db.collection('users').findOne({ userId: userId });
        client.close();
        return !!user;
    }
}

module.exports = User;

