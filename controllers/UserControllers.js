const CatchAsyncErrors = require("../middlewares/CatchAsyncErrors");
const User = require("../model/User");
const ErrorHandler = require("../utils/ErrorHandler");
const bcrypt = require("bcryptjs");
const sendJWT = require("../utils/Jwt");
const crypto = require("crypto");
const { sendEmail } = require("../utils/sendEmail");
const ResetToken = require("../model/resetToken");
const GoogleUser = require("../model/GoogleUser");



exports.createUser = CatchAsyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return next(new ErrorHandler("Enter Complete Information"));
    }
    const googleAcc = await GoogleUser.findOne({ email });
    if (googleAcc) {
        return next(new ErrorHandler("Sign in with Google as your account is linked with Google."));
    }
    const user = new User({ name, email, password });
    const newUser = await user.save();
    sendJWT(newUser, req, res);

})



exports.loginUser = CatchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorHandler("Enter Complete Information"));
    }

    const googleAcc = await GoogleUser.findOne({ email });
    if (googleAcc) {
        return next(new ErrorHandler("Sign in with Google as your account is linked with Google."));
    }


    const foundUser = await User.findOne({ email }).select("+password");
    if (!foundUser) {
        return next(new ErrorHandler("Invalid Email or Password"));
    }


    let checkPass = await bcrypt.compare(password, foundUser.password);
    if (!checkPass) {
        return next(new ErrorHandler("Invalid Email or Password"));

    }


    sendJWT(foundUser, req, res);

})


exports.googleUser = CatchAsyncErrors(async (req, res, next) => {
    const { email, imageUrl, name } = req.body;
    if (!email || !imageUrl || !name) {
        return next(new ErrorHandler("Enter Complete Information"));
    }

    //Check If Account Created with Email
    const foundUser = await User.findOne({ email });
    if (foundUser) {
        return next(new ErrorHandler("Sign in with Email as your account is not linked with Google."));
    } else {
        const googleAcc = await GoogleUser.findOne({ email });
        if (!googleAcc) {
            const user = new GoogleUser({ name, email, imageUrl });
            const newGUser = await user.save();
            sendJWT(newGUser, req, res);
        } else {
            sendJWT(googleAcc, req, res);
        }
    }
})




exports.logoutUser = CatchAsyncErrors(async (req, res, next) => {
    res.clearCookie("backendToken");
    res.status(200).json({ success: true, message: "Logged Out Successfully." });
})




exports.updatePassword = CatchAsyncErrors(async (req, res, next) => {
    const { password, oldPassword } = req.body;
    if (!password || !oldPassword) {
        return next(new ErrorHandler("Enter both Old and New Passwords", 400));
    }
    const loggedInUser = await User.findOne({ _id: req.user._id }).select('+password');
    const isPasswordMatched = await bcrypt.compare(oldPassword, loggedInUser.password);


    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is Incorrect.", 400));
    }
    if (password === oldPassword) {
        return next(new ErrorHandler("Old password and new Password Should not be same.", 400));
    }

    loggedInUser.password = req.body.password;
    await loggedInUser.save();


    sendJWT(loggedInUser, req, res);

})



exports.getUserDetails = CatchAsyncErrors(async (req, res, next) => {
    const loggedInUser = await User.findById(req.user._id);
    if (!loggedInUser) {
        return next(new ErrorHandler("Not Signed In.", 400));
    }
    res.status(200).json({ success: true, loggedInUser });
})



exports.forgotPassword = CatchAsyncErrors(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return next(new ErrorHandler("User Not Found.", 400));
    }
    const token = crypto.randomBytes(20).toString("hex");
    const tokenToStore = crypto.createHash("sha256").update(token).digest("hex");

    const resetUrl = `${req.protocol}://${req.get("host")}/reset/${token}`;
    const message = `Your Password Reset Token is :- \n\n${resetUrl}. If you have not requested this, kindly ignore this email.`;
    await ResetToken.create({ email, token: tokenToStore });
    try {
        const options = {
            email,
            message,
            subject: "Password Recovery Email",
        }
        await sendEmail(options);
        res.status(200).json({ success: true, message: "Message Sent Successfully" });
    } catch (err) {
        await ResetToken.deleteOne({ email });
        return next(new ErrorHandler(err.message, 500));
    }

})


exports.resetPassword = CatchAsyncErrors(async (req, res, next) => {
    const { password } = req.body;
    const token = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const foundToken = await ResetToken.findOne({ token });

    if (!foundToken) {
        return next(new ErrorHandler("Token is Invalid or Expired.", 400));
    }
    const foundUser = await User.findOne({ email: foundToken.email })
    foundUser.password = password;
    const updatedUser = await foundUser.save();
    await ResetToken.deleteOne({ token });
    sendJWT(updatedUser, req, res);

})
