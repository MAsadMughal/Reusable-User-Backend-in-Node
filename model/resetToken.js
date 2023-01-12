const mongoose = require("mongoose");
mongoose.set('strictQuery', false);


const tokenSchema = mongoose.Schema({
    email: {
        type: String,
        required: [true, "Please Enter an email."],
        unique: true,
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: { type: Date, default: Date.now, expires: 360000 }
});

const ResetToken = mongoose.model("ResetToken", tokenSchema);

module.exports = ResetToken;
