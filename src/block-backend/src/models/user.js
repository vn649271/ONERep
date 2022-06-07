const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:false,
        default:''
    },
    wallet:{
        type:String,
        required:true
    },
    parent:{
        type:String,
        required:false,
        default: ''
    },
    sent: {
        type:Number,
        require: false,
        default: 0
    },
    fromDate: {
        type:Date,
        default:Date.now()
    },
    toDate: {
        type:Date,
        default:Date.now()
    },
    userType: {
        type:Number,
        required:false,
        default:1
    },
    isRoot: {
        type:Boolean,
        required:false,
        default:false
    },
    status: {
        type:Boolean,
        required:false,
        default:true
    },
    created_at:{
        type:Date,
        default:Date.now()
    },
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('user', userSchema);;