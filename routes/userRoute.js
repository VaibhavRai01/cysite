const express=require("express");
const user_route=express();
const session = require("express-session");

const config = require("../config/config");
user_route.use(session({secret:config.sessionSecret}));

const auth = require('../middleware/auth')

user_route.set('view engine','ejs');
user_route.set('views','./views/users');

const bodyParser= require('body-parser');
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}));

//multer (for images)
const multer=require("multer");
const path=require("path");

user_route.use(express.static('public')); //public se img access karne ke liye (but humne toh img dali nahi)

const storage= multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/userImages'));
    },
    filename:function(req,file,cb){
        const name= Date.now()+'-'+file.originalname;
        cb(null,name);
    }
})
const upload=multer({storage:storage});

const userController = require("../controllers/userController");

user_route.get("/register",auth.isLogout,userController.loadRegister);
user_route.post('/register',upload.single('image'),userController.insertUser);

user_route.get("/verify",userController.verifyMail);

user_route.get('/',auth.isLogout,userController.home1Load);
user_route.get('/profile',auth.isLogin,userController.profileLoad);

user_route.get('/leaderboard',auth.isLogin,userController.leaderboardLoad);
user_route.get('/practice',auth.isLogin,userController.practiceLoad);
user_route.post('/practice',auth.isLogin,userController.problemDone);

user_route.get('/resource',auth.isLogin,userController.resourceLoad);

user_route.get('/login',auth.isLogout,userController.loginLoad);
user_route.post('/login',userController.verifyLogin);

user_route.get('/home',auth.isLogin,userController.loadHome);

user_route.get('/logout',auth.isLogin,userController.userLogout);

user_route.get('/forget',auth.isLogout,userController.forgetLoad);
user_route.post('/forget',auth.isLogout,userController.forgetVerify);

user_route.get('/forget-password',auth.isLogout,userController.forgetPasswordLoad);
user_route.post('/forget-password',auth.isLogout,userController.resetPassword);

user_route.get('/verification',auth.isLogout,userController.verificationLink);
user_route.post('/verification',auth.isLogout,userController.sendVerificationLink);

user_route.get('/edit',auth.isLogin,userController.editLoad);
user_route.post('/edit',upload.single('Image'),userController.updateProfile);

user_route.get('/verify_cf',auth.isLogin,userController.verify_cf);
user_route.post('/verify_cf',upload.single('Image'),userController.cfVerificationCheck);




  





module.exports= user_route;
