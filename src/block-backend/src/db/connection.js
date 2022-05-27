const mongoose=require('mongoose');
const {DB_URL}=require('../config/conf');
mongoose.Promise=global.Promise;
require('dotenv').config();
mongoose.connect(DB_URL,{ useMongoClient: true }).then(()=>{
    console.log('Mongo NTT Database connected')
}).catch((err)=>{
    console.log(err);
});
module.exports={mongoose}