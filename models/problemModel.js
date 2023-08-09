const mongoose = require("mongoose");
const userSchema= new mongoose.Schema({
    problemIndex:{
        type:String,
        required:true
    },
    problemName:{
        type:String,
        required:true
    },
    problemLink:{
        type:String,
        required:true
    }
    
}); 


module.exports= mongoose.model('problem',userSchema);





