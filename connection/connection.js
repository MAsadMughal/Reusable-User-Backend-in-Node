const mongoose = require('mongoose');

mongoose.connect(process.env.db, function () {
    console.log("Connected to MongoDB");
})