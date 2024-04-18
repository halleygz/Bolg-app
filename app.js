require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const expresslayout = require("express-ejs-layouts");
const methodOverride = require('method-override')
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const session = require('express-session')
const connectDB = require("./server/config/db");
const { configDotenv } = require("dotenv");

const app = express();
const PORT = 5000 || process.env.PORT;

connectDB();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'))
app.use(session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
}));
app.use(express.static("public"));

//template enginies
app.use(expresslayout);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");

app.use("/", require("./server/routes/main"));
app.use("/", require("./server/routes/admin"));

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
