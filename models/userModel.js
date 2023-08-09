const mongoose = require("mongoose");
const userSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
        
    },
    password:{
        type: String,
        required:true
    },
    cf_id:{
        type:String,
    },
    lc_id:{
        type:String,
    },
    is_admin:{
        type:Number,
        required:true
    },
    is_varified:{
        type:Number,
        default:0
    },
    is_cf_verified:{
        type:Number,
        default:0
    },
    token:{
        type:String,
        default:''
    },
    isDone:{
        type:[Number],
        default: function () {
            return new Array(60).fill(0); // Initialize array with length 10 and default value of 0
          }
    }
});


module.exports= mongoose.model('User',userSchema);





