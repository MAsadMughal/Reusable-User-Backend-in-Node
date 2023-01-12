const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
mongoose.set('strictQuery', false);


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
         select: false,
    },
    date: {
        type: Date,
        default: Date.now
    },

});


userSchema.pre('save', async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});




// Method for generating JWT
userSchema.methods.getJWTtoken = function () {

    // Create a secret
    const secret = 'mysecretkey';
    // Define options for jwt.sign method
    const options = {
        expiresIn: '5d' // expires in 5 days
    };
    // Sign the payload with secret and options
    return jwt.sign({ id: this._id }, secret, options);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
