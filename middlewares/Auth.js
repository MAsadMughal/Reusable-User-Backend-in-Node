const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("./CatchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../model/User");

exports.isUserAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const { backendToken } = await req.cookies;
    if (!backendToken) {
        return next(new ErrorHandler("Please Login to access this resource.", 401));
    }
    const decodedData = jwt.verify(backendToken, "mysecretkey");
    req.user = await User.findById(decodedData.id);
    next();
});