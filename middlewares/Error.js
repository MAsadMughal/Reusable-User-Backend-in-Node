const ErrorHandler = require("../utils/errorHandler");
module.exports = (err, req, res, next) => {
  // Wrong MongoDB ObjectID Error
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  if (err.name === "CastError") {
    const message = `Resource not found. Invalid : ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  //Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered.`;
    err = new ErrorHandler(message, 400);
  }

  //WRONG JWT ERROR
  if (err.name === "JsonWebTokenError") {
    const message = `Jsonwebtoken is invalid. try again.`;
    err = new ErrorHandler(message, 400);
  }

  //Token Expire Error
  if (err.name === "TokenExpireError") {
    const message = `Jsonwebtoken is Expired. try again.`;
    err = new ErrorHandler(message, 400);
  }


  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};