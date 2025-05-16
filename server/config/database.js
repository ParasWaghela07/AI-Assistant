const mongoose=require('mongoose');
require('dotenv').config();

const dbconnect=()=>{
    mongoose.connect(process.env.mongodb_url)
    .then(()=>{
        console.log("Database Connection Done Successfully")
    })
    .catch((e)=>{
        console.log("Database Connection Failed")
        console.log(e.message)
    })
}

module.exports=dbconnect;