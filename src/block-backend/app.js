const https = require('https');
const fs = require("fs");
const cors = require("cors");
const express = require("express");
const app = express();
const auth=require('./src/config/passport')();
const passport = require("passport");
const bodyParser = require('body-parser');
const User = require("./src/models/user");
const localStrategy = require("passport-local");
const mongoose = require('./src/db/connection');
const {SERVER_URL} = require('./src/config/conf');
const http = require('http');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//passport middleware
app.use(auth.initialize());

app.use(express.static('public'));

//passport config
passport.use(new localStrategy(User.authenticate()));
app.use(passport.initialize());
app.use(passport.session());

global.__basedir = __dirname;
var corsOptions = {
  origin: "*"
};
// app.use(cors(corsOptions));
app.use(cors());
const initRoutes = require("./src/routes");
initRoutes(app);
let port = process.env.PORT;

var privateKey = fs.readFileSync( 'key.pem' );
var certificate = fs.readFileSync( 'cert.pem' );

https.createServer({
  key: privateKey,
  cert: certificate
}, app).listen(port);
