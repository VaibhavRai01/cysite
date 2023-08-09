const mongoose = require("mongoose");
const userSchema= new mongoose.Schema({
    eventName:{
        type:String,
        required:true
    },
    date:{
        type:String,
        required:true
    },
    imageLink:{
        type:String
    },
    contestLink:{
        type:String
    }
    
}); 


module.exports= mongoose.model('event',userSchema);





