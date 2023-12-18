const mongoose=require("mongoose");
mongoose.connect("mongodb+srv://21ucs225:cysite741852963@cluster0.pkur0h3.mongodb.net/");


const express= require("express");
const app=express();


//for user routes
const userRoute =require('./routes/userRoute');
 
app.use('/',userRoute);

//for admin route
const adminRoute =require('./routes/adminRoute');

app.use('/admin',adminRoute);

app.listen(3000,function(){
    console.log("server running");
});