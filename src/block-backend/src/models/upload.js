const mongoose=require('mongoose');
const uploadSchema=new mongoose.Schema({
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
    parent:{
        type:String,
        required:false,
        default:''
    },
    created_at:{
        type:Date,
        default:Date.now()
    },
});
module.exports=mongoose.model('upload',uploadSchema);