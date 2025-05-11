class UserBean {
    _username = '';
    _userId = '';
    _userPassword = '';
    _userEmail = '';
    _userRole = false;

    constructor(){
        this._username = '';
        this._userId = '';
        this._userPassword = '';
        this._userEmail = '';
        this._userRole = false;
    }

    get username() {
        return this._username;
    }
    set username(name) {
        this._username = name;
    }

    get userId() {
        return this._userId;
    }
    set userId(id) {
        this._userId = id;
    }

    get userPassword() {
        return this._userPassword;
    }
    set userPassword(password) {
        this._userPassword = password;
    }

    get userEmail() {
        return this._userEmail;
    }
    set userEmail(email) {
        this._userEmail = email;
    }
    get userRole() {
        return this._userRole;
    }
    set userRole(role) {
        this._userRole = role;
    }   
}

export default UserBean;