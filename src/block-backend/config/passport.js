const LocalStrategy=require('passport-local').Strategy;
const bcrypt=require('bcrypt');
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
var params = {
    secretOrKey: 'secret',
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken("jwt")
  };
var passport = require("passport");
const { User } = require('../models/user');

module.exports=function(){
    passport.use(new LocalStrategy({usernameField:'email'},(email,password,done)=>{
        User.findOne({email:email}).then((user)=>{
            if(!user){
                return done(null,false,'User Not Found');
            }
            bcrypt.compare(password,user.password,(err,isMatch)=>{
                if(err) throw err;
                if(isMatch){
                    return done(null,user);
                }else{
                return done(null,false,{message:'Password Incorrect'})
                }
            });

        })
    }));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
        done(err, user);
        });
    });

    passport.use(new JwtStrategy(params, function(jwt_payload, done) {
        User.findById(jwt_payload.id, function(err, user) {
            if (err) {
              return done(new Error("UserNotFound"), null);
            } else if(payload.expire<=Date.now()) {
              return done(new Error("TokenExpired"), null);
            } else{
              return done(null, user);
            }
        });
    }));

    return {
        initialize: function() {
            return passport.initialize();
        },
        authenticate: function() {
            return passport.authenticate("jwt", {session: false});
        }
    };
};

