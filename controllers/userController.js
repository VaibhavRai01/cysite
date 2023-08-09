const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const config = require("../config/config");
const randomstring = require('randomstring');
const Leaderboard = require('../models/leaderboard');
const problems = require('../models/problemModel');
const fetch = require("node-fetch");
const events= require("../models/eventModel");
// user profile edit and update

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}

const sendVerifyMail = async (name, email, user_id) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        });

        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: "Verification Mail",
            html: '<p>Hello ' + name + ' click here to <a href="http://127.0.0.1:3000/verify?id=' + user_id + '"> verify</a> your mail. </p>'
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log("email sent", info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}

//for reset password mail

const sendResetPasswordMail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        });

        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: "Reset Password",
            html: '<p>Hello ' + name + ' click here to <a href="http://127.0.0.1:3000/forget-password?token=' + token + '"> Reset </a> your password. </p>'
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log("email sent", info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}

const loadRegister = async (req, res) => {
    try {
        res.render('registration');
    }
    catch (error) {
        console.log(error.message);
    }
}

const insertUser = async (req, res) => {
    try {
        const spassword = await securePassword(req.body.password);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: spassword,
            is_admin: 0
        });
        const userData = await user.save();
        const leader = new Leaderboard({
            name: userData.name,
            email: userData.email,
        });
        const leaderData = await leader.save();

        if (userData) {
            sendVerifyMail(req.body.name, req.body.email, userData._id);
            res.render('registration', { message: "Registration successful.  Verify your mail" });
        }
        else {
            res.render('registration', { message: "Rgistration failed." });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const verifyMail = async (req, res) => {
    try {
        const updateInfo = await User.updateOne({ _id: req.query.id }, { $set: { is_varified: 1 } });
        console.log(updateInfo);
        res.render("email-verified");
    } catch (error) {
        console.log(error.message)
    }
}

//login user methods started
const home1Load = async (req, res) => {
    try {
        const eventData = await events.find();
        let eventboard;
        eventboard = eventData.sort((a, b) => b.date - a.date);
        res.render('home1',{event:eventboard});
    } catch (error) {
        console.log(error.message);
    }
}
const profileLoad = async (req, res) => {
    try {
        const userData1 = await User.findOne({ _id: req.session.user_id });
        const userData2 = await Leaderboard.findOne({ email: userData1.email });

        res.render('profile', { user: userData1, leaderboard: userData2 });
    } catch (error) {
        console.log(error.message);
    }
}



const leaderboardLoad = async (req, res) => {
    try {
        const userData1 = await User.findOne({ _id: req.session.user_id });
        const userData2 = await Leaderboard.find();
        const sortCriteria = req.query.sort; // Get the sorting criteria from query parameters
        // Sort the leaderboard data based on the sorting criteria
        let sortedLeaderboard;
        if (sortCriteria === 'cf_rating') {
            
            sortedLeaderboard = userData2.sort((a, b) => b.cf_rating - a.cf_rating);
        } 
        else if (sortCriteria === 'cf_rating2') {
            
            sortedLeaderboard = userData2.sort((a, b) => a.cf_rating - b.cf_rating);
        } else if (sortCriteria === 'cf_solved') {
            sortedLeaderboard = userData2.sort((a, b) => b.cf_solved - a.cf_solved);
        } 
        else if (sortCriteria === 'cf_solved2') {
            sortedLeaderboard = userData2.sort((a, b) => a.cf_solved - b.cf_solved);
        }
        else if (sortCriteria === 'lc_solved') {
            sortedLeaderboard = userData2.sort((a, b) => b.lc_solved - a.lc_solved);
        } 
        else if (sortCriteria === 'lc_solved2') {
            sortedLeaderboard = userData2.sort((a, b) => a.lc_solved - b.lc_solved);
        } 
        else if (sortCriteria === 'lc_rating') {
            sortedLeaderboard = userData2.sort((a, b) => b.lc_rating - a.lc_rating);
        } 
        else if (sortCriteria === 'lc_rating2') {
            sortedLeaderboard = userData2.sort((a, b) => a.lc_rating - b.lc_rating);
        } 
        else if (sortCriteria === 'lc_easy') {
            sortedLeaderboard = userData2.sort((a, b) => b.lc_easy - a.lc_easy);
        } 
        else if (sortCriteria === 'lc_easy2') {
            sortedLeaderboard = userData2.sort((a, b) => a.lc_easy - b.lc_easy);
        } 
        else if (sortCriteria === 'lc_medium') {
            sortedLeaderboard = userData2.sort((a, b) => b.lc_medium - a.lc_medium);
        }
        else if (sortCriteria === 'lc_medium2') {
            sortedLeaderboard = userData2.sort((a, b) => a.lc_medium - b.lc_medium);
        }
        else if (sortCriteria === 'lc_hard') {
            sortedLeaderboard = userData2.sort((a, b) => b.lc_hard - a.lc_hard);
        }  
        else if (sortCriteria === 'lc_hard2') {
            sortedLeaderboard = userData2.sort((a, b) => a.lc_hard - b.lc_hard);
        }  
        else {
            sortedLeaderboard = userData2; // Default sorting if no criteria specified
        }

        // Render the leaderboard view with the sorted data
        res.render('leaderboard', { user:userData1,leaderboard: sortedLeaderboard });
    } catch (error) {
        console.log(error.message);
    }
}




const loginLoad = async (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({ email: email });
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_varified === 0) {
                    res.render('login', { message: "Please verify your mail." });
                }
                else {
                    req.session.user_id = userData._id;
                    res.redirect('/home');
                }
            }
            else {
                res.render('login', { message: "Email and password is incorrect" });
            }
        }
        else {
            res.render('login', { message: "Email and password is incorrect" });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadHome = async (req, res) => {
    try {
        const eventData = await events.find();
        let eventboard;
        eventboard = eventData.sort((a, b) => b.date - a.date);
        const userData = await User.findById({ _id: req.session.user_id });
        res.render('home', { user: userData, event:eventboard });
    } catch (error) {
        console.log(error.message);
    }
}

const userLogout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        console.log(error.message);
    }
}

//forget password code starts

const forgetLoad = async (req, res) => {
    try {
        res.render('forget');
    } catch (error) {
        console.log(error.message);
    }
}

const forgetVerify = async (req, res) => {
    try {
        const email = req.body.email;
        const userData = await User.findOne({ email: email });
        if (userData) {
            const randomString = randomstring.generate();
            const updatedData = await User.updateOne({ email: email }, { $set: { token: randomString } });
            sendResetPasswordMail(userData.name, userData.email, randomString);
            res.render('forget', { message: "Please check your mail to reset your password." });
        }
        else {
            res.render('forget', { message: "User email not found" });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const forgetPasswordLoad = async (req, res) => {
    try {
        const token = req.query.token;
        const tokenData = await User.findOne({ token: token });
        if (tokenData) {
            res.render('forget-password', { user_id: tokenData._id });
        }
        else {
            res.render('404', { message: "Token is invalid." });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const resetPassword = async (req, res) => {
    try {
        const password = req.body.password;
        const user_id = req.body.user_id;




        const secure_password = await securePassword(password);
        const updatedData = await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: secure_password, token: '' } });
        res.redirect("/");




    } catch (error) {
        console.log(error.message);
    }
}

//for verification mail send link

const verificationLink = async (req, res) => {
    try {
        res.render('verification')




    } catch (error) {
        console.log(error.message);
    }
}

const sendVerificationLink = async (req, res) => {
    try {
        const email = req.body.email;
        const userData = await User.findOne({ email: email });
        if (userData) {
            sendVerifyMail(userData.name, userData.email, userData._id);
            res.render('verification', { message: "Verification link sent on your mail, please check" });
        }
        else {
            res.render('verification', { message: "This email does not exist" });
        }
    } catch (error) {
        console.log(error.message);
    }
}
const updateProfile = async (req, res) => {
    try {
        const userDatax = await User.findById({ _id: req.session.user_id });
        const handle = req.body.lc_id;
        const link = "https://leetcode.com/graphql?query=query{%20matchedUser(username:%20%22" + handle + " %22)%20{%20username%20submitStats:%20submitStatsGlobal%20{%20acSubmissionNum%20{%20difficulty%20count%20submissions%20}%20}%20}%20}"
        const link2 = "https://leetcode.com/graphql?query=query%20{%20userContestRanking(username:%20%20%22" + handle + "%22)%20{%20attendedContestsCount%20rating%20globalRanking%20totalParticipants%20topPercentage%20}}"
        const query = await fetch(link);
        const result = await query.json();
        const query2 = await fetch(link2);
        const result2 = await query2.json();
        console.log(handle);
        console.log(result['data']['matchedUser'])
        if (result['data']['matchedUser'] == null && handle != "") {
            res.render('edit', { user: userDatax, message: "Invalid lc id" });
        }
        else {
            const data = await User.findById({ _id: req.body.user_id });
            if (data.cf_id != req.body.cf_id) {
                const userData1 = await User.findByIdAndUpdate({ _id: req.body.user_id }, { $set: { is_cf_verified: 0 } });
            }
            const userData = await User.findByIdAndUpdate({ _id: req.body.user_id }, { $set: { name: req.body.name, email: req.body.email, cf_id: req.body.cf_id, lc_id: req.body.lc_id } });
            if (handle != "") {
                const solved = result['data']['matchedUser']['submitStats']['acSubmissionNum'][0]['count'];
                const ez = result['data']['matchedUser']['submitStats']['acSubmissionNum'][1]['count'];
                const med = result['data']['matchedUser']['submitStats']['acSubmissionNum'][2]['count'];
                const hard = result['data']['matchedUser']['submitStats']['acSubmissionNum'][3]['count'];
                if (result2['data']['userContestRanking'] == null) {
                    const leaderData = await Leaderboard.findOneAndUpdate({ email: userData.email }, { $set: { lc_id: handle, lc_easy: ez, lc_medium: med, lc_hard: hard, lc_solved: solved, lc_rating: 0 } });
                }
                else {
                    const rating = Math.trunc(result2['data']['userContestRanking']['rating']);
                    const leaderData = await Leaderboard.findOneAndUpdate({ email: userData.email }, { $set: { lc_id: handle, lc_easy: ez, lc_medium: med, lc_hard: hard, lc_solved: solved, lc_rating: rating } });
                }

            }

            res.redirect('/profile');
        }

    }
    catch (error) {
        console.log(error.message);
    }
}


const editLoad = async (req, res) => {
    try {
        const id = req.query.id;
        const userData = await User.findById({ _id: id });
        const userData2 = await Leaderboard.findOne({ email: userData.email });

        
        if (userData) {
            res.render('edit', { user: userData, leaderboard: userData2 });
        }
        else {
            res.redirect('/home');
        }
    } catch (error) {
        console.log(error.message);
    }
}

const verify_cf = async (req, res) => {
    try {
        const userData1 = await User.findById({ _id: req.session.user_id });
        const id = req.query.id;
        const userData = await User.findById({ _id: id });
        const handle = userData.cf_id;
        const link = "https://codeforces.com/api/user.info?handles=" + handle;
        const query = await fetch(link);
        const data = await query.json();
        if (data['status'] == 'OK') {
            res.render('verify_cf', { user: userData1 });
        }
        else {
            res.render('verify_cf', { user: userData1, message: "galat id hai be" });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const cfVerificationCheck = async (req, res) => {
    try {
        const id = req.query.id;
        const userData = await User.findById({ _id: id });
        const handle = userData.cf_id;
        console.log(handle);
        const link = "https://codeforces.com/api/user.info?handles=" + handle;
        const query = await fetch(link);
        const data = await query.json();
        if (data['result'][0]['lastName'] == "Jain") {
            const userData1 = await User.findByIdAndUpdate({ _id: id }, { $set: { is_cf_verified: 1 } });
            rating = 0;
            let solved = new Set();
            const link2 = "https://codeforces.com/api/user.status?handle=" + handle;
            const query1 = await fetch(link2);
            let data1 = await query1.json();
            data1 = data1['result'];
            for (let i = 0; i < data1.length; i++) {
                if (data1[i]['verdict'] == "OK") {
                    problem = data1[i]['problem']['contestId'] + data1[i]['problem']['index'];
                    solved.add(problem);
                }
            }
            console.log(solved.size);
            if (data['result'][0]['rating'] != undefined) {
                rating = data['result'][0]['rating'];
            }
            const leaderData = await Leaderboard.findOneAndUpdate({ email: userData.email }, { $set: { cf_id: handle, cf_rating: rating, cf_solved: solved.size } });
            res.redirect('/profile');
        }
        else {
            res.render('verify_cf', { user: userData, message: "nhi hua verify" });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const practiceLoad = async (req, res) => {
    try {
        const p = await problems.find();
        const userData1 = await User.findOne({_id: req.session.user_id});
        res.render('practice', {problems: p, user: userData1});
    } catch (error) {
        console.log(error.message);
    }
}

const problemDone = async (req, res) => {
    try {
        const row1 = req.body.yay;
        console.log(row1);
        const userData1 = await User.findOne({_id: req.session.user_id});
        let x = userData1.isDone[row1];
        const userData = await User.findOneAndUpdate({_id: req.session.user_id},{$set:{[`isDone.${row1}`]: !x}});
        const p = await problems.find();
        const userData2 = await User.findOne({_id: req.session.user_id});
        // console.log(userData.isDone);
        res.render('practice', {problems: p, user: userData2});
    } catch (error) {
        console.log(error.message);
    }
}

const resourceLoad = async (req, res) => {
    try {
        res.render('resource');
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadRegister,
    insertUser,
    verifyMail,
    loginLoad,
    verifyLogin,
    loadHome,
    userLogout,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword,
    verificationLink,
    sendVerificationLink,
    editLoad,
    updateProfile,
    verify_cf,
    cfVerificationCheck,
    home1Load,
    profileLoad,
    leaderboardLoad,
    practiceLoad,
    problemDone,
    resourceLoad
}