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
app.listen(port, () => {
  console.log(`Running at :${SERVER_URL}:${port}`);
  // var options = {
  //   port: port,
  //   host: '0.0.0.0',
  // };   
  // var request = http.request(options);
  // request.setHeader ('Access-Control-Allow-Origin', 'de66-116-202-24-219.ngrok.io');
  // request.setHeader ('Access-Control-Allow-Origin', '8983-188-43-136-43.ngrok.io');
  // request.setHeader ("Access-Control-Allow-Origin", "*");
  // request.setHeader ("Access-Control-Expose-Headers", "Content-Length, X-JSON");
  // request.setHeader ("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  // request.setHeader ("Access-Control-Allow-Headers", "*");
  // request.end ();
});