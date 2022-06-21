const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
    filename:{
        type:String,
        required:true
    },
    ipfsuri:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        required:false,
        default:false
    },
    reputation: {
        type:Number,
        required:false,
        default:0
    },
    importer:{
        type:String,
        required:true,
        default:''
    },
    badge:{
        type:String,
        required:true,
        default:''
    },
    created_at:{
        type:Date,
        default: Date.now()
    },
});

module.exports = mongoose.model('upload', uploadSchema);