const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
mongoose.set('strictQuery', false);


const googleUserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    imageUrl: {
        type: String,
        required: true,
        unique: true,
    },
    date: {
        type: Date,
        default: Date.now
    },

});



// Method for generating JWT
googleUserSchema.methods.getJWTtoken = function () {

    // Create a secret
    const secret = 'mysecretkey';
    // Define options for jwt.sign method
    const options = {
        expiresIn: '5d' // expires in 5 days
    };
    // Sign the payload with secret and options
    return jwt.sign({ id: this._id }, secret, options);
};

const GoogleUser = mongoose.model("GoogleUser", googleUserSchema);

module.exports = GoogleUser;
