const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");
const bcrypt=require('bcrypt');
const userSchema=new mongoose.Schema({

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
    badge:{
        type:String,
        required:false,
        default:''
    },
    dao:{
        type:String,
        required:false,
        default:''
    },
    received: {
        type:Number,
        require: false,
        default: 0
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
    isAdmin: {
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
    badgeAddress:{
        type:String,
        required: true,
        default: ''
    }
});
// userSchema.pre('save',function(next){
//     var user=this;
//     if(user.isModified('password')){
//         bcrypt.genSalt(10,(err,salt)=>{
//             bcrypt.hash(user.password,salt,(err,hash)=>{
//                 user.password=hash;
//                 next();
//             });
            
//         });
//     }else{
//         next();
//     }
// });

userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model('User',userSchema);;