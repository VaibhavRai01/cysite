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
    cf_id:{
        type:String,
        default:"null"
    },
    lc_id:{
        type:String,
        default:"null"
    },
    cf_rating:{
        type:Number,
        default:0
    },
    cf_solved:{
        type:Number,
        default:0
    },
    lc_rating:{
        type:Number,
        default:0
    },
    lc_solved:{
        type:Number,
        default:0
    },
    lc_hard:{
        type:Number,
        default:0
    },
    lc_medium:{
        type:Number,
        default:0
    },
    lc_easy:{
        type:Number,
        default:0
    }
});


module.exports= mongoose.model('Leaderboard',userSchema);