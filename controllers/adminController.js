const User = require("../models/userModel");
const Leaderboard= require("../models/leaderboard");
const events= require("../models/eventModel");
const problem= require("../models/problemModel");
const bcrypt= require("bcrypt");
const nodemailer= require('nodemailer');
const randomstring=require("randomstring");
const config=require("../config/config");
const problems = require('../models/problemModel');



const securePassword= async(password)=>{
    try {
        const passwordHash= await bcrypt.hash(password,10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}

const addUserMail= async(name,email, password, user_id)=>{
    try {
        const transporter= nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:config.emailUser,
                pass:config.emailPassword
            }
        });

        const mailOptions={
            from:config.emailUser,
            to:email,
            subject:"Adminadd you and verify your mail",
            html:'<p>Hello '+name+' click here to <a href="http://127.0.0.1:3000/verify?id='+user_id+'"> verify</a> your mail. </p> <br><br> <b>Email- </b> '+email+' <br><b>Password -</b>'+password+''

        }
        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error);
            }
            else{
                console.log("email sent",info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}

const sendResetPasswordMail= async(name,email,token)=>{
    try {
        const transporter= nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:config.emailUser,
                pass:config.emailPassword
            }
        });

        const mailOptions={
            from:config.emailUser,
            to:email,
            subject:"Reset Password",
            html:'<p>Hello '+name+' click here to <a href="http://127.0.0.1:3000/admin/forget-password?token='+token+'"> Reset </a> your password. </p>'

        }
        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error);
            }
            else{
                console.log("email sent",info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}

const loadLogin= async(req,res)=>{
    try {
        
        res.render('login');
    } catch (error) {
        console.log(error.message);
    }
}


const verifyLogin = async(req,res)=>{
    try {
        const email=req.body.email;
        const password= req.body.password;


        const userData = await User.findOne({email:email});


        if(userData){
            const passwordMatch=await bcrypt.compare(password,userData.password);
            if(passwordMatch){
                if(userData.is_admin === 0){
                    res.render('login',{message:"invalid mail or passwrord"});
                }
                else{
                    req.session.user_id= userData._id;
                    res.redirect("/admin/home");
                }
            }
            else{
                res.render('login',{message:"invalid mail or password"});
            }
        }
        else{
            res.render('login',{message:"invalid mail or password"});
        }


    } catch (error) {
        console.log(error.message);
    }
}


const loadDashboard= async(req,res)=>{
    try {

        const userData = await User.findById({_id:req.session.user_id});
        if(userData.is_admin==0){
            res.render('404',{message:"oo bsd wale chacha aukaat m"});
        }
        res.render('home',{admin:userData});
    } catch (error) {
        console.log(error.message);
    }
}


const logout=async(req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/admin');


    } catch (error) {
        console.log(error.message);
    }
}


const forgetLoad= async(req,res)=>{
    try {
        const userData = await User.findById({_id:req.session.user_id});
        if(userData.is_admin==0){
            res.render('404',{message:"oo bsd wale chacha aukaat m"});
        }
        res.render('forget');
    } catch (error) {
        console.log(error.message);
    }
}


const forgetVerify= async(req,res)=>{
    try {
        const email =req.body.email;
        const userData= await User.findOne({email:email});
        if(userData){
            if(userData.is_admin==0){
                res.render('forget',{message:'invalid email'});


            }
            else{
                const randomString = randomstring.generate();
                const updatedData = await User.updateOne({email:email},{$set:{token:randomString}});
                sendResetPasswordMail(userData.name,userData.email,randomString);
                res.render('forget',{message:'reset link sent to your mail'});
            }
        }
        else{
            res.render('forget',{message:'invelid email'});
        }


    } catch (error) {
        console.log(error.message);
    }
}

const forgetPasswordLoad = async(req,res)=>{
    try {
        const userData = await User.findById({_id:req.session.user_id});
        if(userData.is_admin==0){
            res.render('404',{message:"oo bsd wale chacha aukaat m"});
        }
        
        const token = req.query.token;
        const tokenData = await User.findOne({token:token});
        if (tokenData) {
            res.render('forget-password',{user_id:tokenData._id});
        }
        else
        {
            res.render('404',{message:"Token is invalid."});
        }
    } catch (error) {
        console.log(error.message);
    }
}

const resetPassword = async(req,res)=>{
    try {
        const userData = await User.findById({_id:req.session.user_id});
        if(userData.is_admin==0){
            res.render('404',{message:"oo bsd wale chacha aukaat m"});
        }
        const password = req.body.password;
        const user_id = req.body.user_id;

        const secure_password = await securePassword(password);
        const updatedData = await User.findByIdAndUpdate({_id:user_id},{$set:{password:secure_password, token:''}});
        res.redirect("/admin");

    } catch (error) {
        console.log(error.message);
    }
}


const adminDashboard = async(req,res)=>{
    try {
        const userData1 = await User.findById({_id:req.session.user_id});
        if(userData1.is_admin==0){
            res.render('404',{message:"oo bsd wale chacha aukaat m"});
        }
        const userData = await User.find({is_admin:0});
        res.render('dashboard',{users:userData});
    } catch (error) {
        console.log(error.message);
    }
}

//New users add

const newUserLoad = async(req,res)=>{
    try {
        const userData = await User.findById({_id:req.session.user_id});
        if(userData.is_admin==0){
            res.render('404',{message:"oo bsd wale chacha aukaat m"});
        }
        res.render('new-user');
    } catch (error) {
        console.log(error.message);
    }
}

const addUser = async(req,res)=>{
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = randomstring.generate(8);
        const spassword = await securePassword(password);
        const user = new User({
            name:name,
            email:email,
            password:spassword,
            is_admin:0
        });

        const userData = await user.save();

        if(userData)
        {
            addUserMail(name, email, password, userData._id);
            res.redirect('/admin/dashboard');
        }
        else
        {
            res.render('new-user',{message:"Something wrong"});
        }
    } catch (error) {
        console.log(error.message);
    }
}

//edit user functionality

const editUserLoad = async(req,res)=>{
    try {
        const userData1 = await User.findById({_id:req.session.user_id});
        if(userData1.is_admin==0){
            res.render('404',{message:"oo bsd wale chacha aukaat m"});
        }
        const id = req.query.id;
        const userData = await User.findById({_id:id});
        
        if(userData.is_admin==0){
            res.render('404',{message:"oo bsd wale chacha aukaat m"});
        }
        if(userData){
            res.render('edit-user',{user:userData});   
        }
        else
        {
            res.redirect('/admin/dashboard');
        }
    } catch (error) {
        console.log("Hello");
        console.log(error.message);
    }
}

const updateUser= async(req,res)=>{
    try {
        const userData1 = await User.findById({_id:req.session.user_id});
        if(userData1.is_admin==0){
            res.render('404',{message:"oo bsd wale chacha aukaat m"});
        }
        const userData = await User.findByIdAndUpdate({_id:req.body.id },{ $set:{name:req.body.name, email:req.body.email, is_varified:req.body.verify , cf_id:req.body.cf_id, lc_id:req.body.lc_id}});
        const leaderData = await Leaderboard.findOneAndUpdate({email:userData.email},{$set:{cf_id:req.body.cf_id, lc_id:req.body.lc_id}});
        console.log(req.body.cf_id);
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.log(error.message);
    }
}


//delete users
const deleteUser = async(req,res)=>{
    try {
        const userData = await User.findById({_id:req.session.user_id});
        if(userData.is_admin==0){
            res.render('404',{message:"oo bsd wale chacha aukaat m"});
        }
        const id = req.query.id;
        await User.deleteOne({ _id:id });
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.log(error.message);
    }
}


const addProblemLoad= async(req,res)=>{
    try {

        const userData = await User.findById({_id:req.session.user_id});
        const problemData = await problems.find();
        if(userData.is_admin==0){
            res.render('404',{message:"oo bsd wale chacha aukaat m"});
        }
        res.render('problems',{admin:userData, problem:problemData});
    } catch (error) {
        console.log(error.message);
    }
}


const addProblem = async(req,res)=>{
    try {
        const index = req.body.index;
        const name = req.body.name;
        const link = req.body.link;
        const Problem = new problem({
            problemName:name,
            problemIndex:index,
            problemLink:link,
            
        });

        const problemData1 = await Problem.save();
        const problemData = await problems.find();
        res.render('problems',{message:"added sexfully",problem:problemData})
       
    } catch (error) {
        console.log(error.message);
    }
}


const deleteProblem = async(req,res)=>{
    try {
        const userData = await User.findById({_id:req.session.user_id});
        if(userData.is_admin==0){
            res.render('404',{message:"oo bsd wale chacha aukaat m"});
        }
        const id = req.query.id;
        await problems.deleteOne({ _id:id });
        res.redirect('/admin/add-problems');
    } catch (error) {
        console.log(error.message);
    }
}

const addEventLoad= async(req,res)=>{
    try {

        const userData = await User.findById({_id:req.session.user_id});
        const eventData = await events.find();
        if(userData.is_admin==0){
            res.render('404',{message:"oo bsd wale chacha aukaat m"});
        }
        let eventboard;
        eventboard = eventData.sort((a, b) => b.date - a.date);
        res.render('events',{admin:userData, event:eventboard});
        
    } catch (error) {
        console.log(error.message);
    }
}

function formatDate(inputDateTime) {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
  
    const dateTimeParts = inputDateTime.split("T");
    const datePart = dateTimeParts[0];
    const timePart = dateTimeParts[1];

    const dateParts = datePart.split("-");
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Months are 0-indexed in JavaScript Date objects
    const day = parseInt(dateParts[2]);
  
    // Extract hours and minutes from the time part
    const timeParts = timePart.split(":");
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);

    // Create a new Date object using the extracted year, month, day, hours, and minutes
    const formattedDateTime = new Date(year, month, day, hours, minutes);
  
    // Extract the day, month name, and year from the Date object
    const dayOfMonth = formattedDateTime.getDate();
    const monthName = months[formattedDateTime.getMonth()];
    const yearValue = formattedDateTime.getFullYear();
  
    // Format hours and minutes with leading zeros
    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");

    // Create the final formatted date and time string
    const formattedString = `${dayOfMonth} ${monthName} ${yearValue}, ${formattedHours}:${formattedMinutes}`;
  
    return formattedString;
}

const addEvent = async(req,res)=>{
    try {
        const cname = req.body.contestName;
        const ilink = req.body.imageLink;
        const clink = req.body.contestLink;
        const date = req.body.date;
        const date1 = formatDate(date);
        const Event = new events({
            eventName:cname,
            contestLink:clink,
            imageLink:ilink,
            date:date1
            
        });

        const eventData1 = await Event.save();
        const eventData = await events.find();
        res.render('events',{message:"added sexfully",event:eventData})
       
    } catch (error) {
        console.log(error.message);
    }
}
const deleteEvent = async(req,res)=>{
    try {
        const userData = await User.findById({_id:req.session.user_id});
        if(userData.is_admin==0){
            res.render('404',{message:"oo bsd wale chacha aukaat m"});
        }
        const id = req.query.id;
        await events.deleteOne({ _id:id });
        res.redirect('/admin/add-events');
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword,
    adminDashboard,
    newUserLoad,
    addUser,
    addUserMail,
    editUserLoad,
    updateUser,
    deleteUser,
    addProblemLoad,
    addProblem,
    deleteProblem,
    addEventLoad,
    addEvent,
    deleteEvent
}

