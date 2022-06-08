const mongoose = require('mongoose');

const userDaoSchema = new mongoose.Schema({
    userAddress:{
        type:String,
        required:true,
        default:''
    },
    badgeAddress:{
        type:String,
        required:true,
        default:''
    },
    received: {
        type:Number,
        require: true,
        default: 0
    },
    isCreator: {
        type: Boolean,
        require: true,
        default: false
    },
    created_at:{
        type:Date,
        default:Date.now()
    }
});

module.exports = mongoose.model('userDao', userDaoSchema);