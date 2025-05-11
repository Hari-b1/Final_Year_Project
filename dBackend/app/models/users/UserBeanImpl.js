import UserBean from './UserBean.js';
import bcrypt from 'bcrypt';

class UserBeanImpl extends UserBean {

    static Users = {};

    constructor() {
        super();
    }

    static createUser(username, userId, userPassword, userEmail, userRole) {
        this.username = username;
        this.userId = userId;
        this.userPassword = UserBeanImpl.encryptPassword(userPassword);
        this.userEmail = userEmail;
        this.userRole = userRole;
        UserBeanImpl.Users[userId] = this;
    }

    static encryptPassword(password) {
        return bcrypt.hashSync(password, 10);
    }

    static getUser(userId) {
        return UserBeanImpl.Users[userId];
    }
}

export default UserBeanImpl;