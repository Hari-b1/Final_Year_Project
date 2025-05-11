const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    userid: { type: String, required: true, unique: true },
    userPassword: { type: String, required: true },
    userEmail: { type: String, required: true, unique: true },
    userRole: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);
