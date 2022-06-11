const dotenv = require("dotenv");
const https = require('https');
const fs = require("fs");
const cors = require("cors");
const express = require("express");
const app = express();
const auth = require('./src/config/passport')();
const passport = require("passport");
const bodyParser = require('body-parser');
const User = require("./src/models/user");
const localStrategy = require("passport-local");
const { FRONEND_URL } = require("./src/config/conf");

dotenv.config();

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

app.use(cors({ 
  credentials: true, origin: [FRONEND_URL] 
}));

global.__basedir = __dirname;
var corsOptions = {
  origin: "*"
};
// app.use(cors(corsOptions));
app.use(cors());
const initRoutes = require("./src/routes");
initRoutes(app);
let port = process.env.PORT || 3001;
console.log("ENV.PORT=", port);
var privateKey = fs.readFileSync('key.pem');
var certificate = fs.readFileSync('cert.pem');

https.createServer({
  key: privateKey,
  cert: certificate
}, app).listen(port, '0.0.0.0', err => {
  if (err) {
    console.log("Failed to start server", err);
  } else {
    console.log("Server started at port", port, "successfully")
  }
});
