const express = require('express');
const path=require('path');
require('dotenv').config({ path: path.resolve(__dirname, './config/.env') })
const router = require('./router/router');
require("./connection/connection");
const errorMiddleware = require("./middlewares/Error");
const cookieParser = require("cookie-parser");
const app = express();



//uncaughtException Error Handled
process.on("uncaughtException", (err) => {
    server.close(() => {
        process.exit(1);
    });
});


//Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
    server.close(() => {
        process.exit(1);
    });
});

//JSON request-body Handler
app.use(express.json());
//Managing Cookies in backend
app.use(cookieParser());
//Using Routes
app.use(router)
//Error Middleware for Messages
app.use(errorMiddleware);



const server = app.listen((5000), () => {
    console.log("listening on port", 5000);
});
