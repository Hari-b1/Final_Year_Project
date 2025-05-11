class User {

    _username;
    _userid;
    _userPassword;
    _userEmail;
    _userRole;
    constructor() {
        this._username = '';
        this._userid = '';
        this._userPassword = '';
        this._userEmail = '';
        this._userRole = false;   // Streamer = true, Viewer = false
    }

    get username() {
        return this._username;
    }
    set username(username) {
        this._username = username;
    }

    get userid() {
        return this._userid;
    }  
    set userid(userid) {
        this._userid = userid;
    }

    get userPassword() {
        return this._userPassword;
    }
    set userPassword(userPassword) {
        this._userPassword = userPassword;
    }

    get userEmail() {
        return this._userEmail;
    }
    set userEmail(userEmail) {
        this._userEmail = userEmail;
    }

    get userRole() {
        return this._userRole;
    }
    set userRole(userRole) {
        this._userRole = userRole;
    }
}

module.exports = User;