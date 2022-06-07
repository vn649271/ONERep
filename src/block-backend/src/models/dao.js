const mongoose = require('mongoose');

const daoSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        default:''
    },
    badge:{
        type:String,
        required:true,
        default:''
    },
    badgeAddress:{
        type:String,
        required: true,
        default: ''
    },
    created_at:{
        type:Date,
        default:Date.now()
    }
});

module.exports = mongoose.model('dao', daoSchema);;