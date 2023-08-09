const express= require("express");
const admin_route=express();

const session=require("express-session");
const config=require("../config/config");
admin_route.use(session({secret:config.sessionSecret}))

const bodyParser= require("body-parser");
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({extended:true}));

admin_route.set('view engine','ejs');
admin_route.set('views','./views/admin');

const multer=require("multer");
const path=require("path");

admin_route.use(express.static('public')); //public se img access karne ke liye (but humne toh img dali nahi)

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

const auth=require("../middleware/adminAuth");
const adminController = require("../controllers/adminController");


admin_route.get('/',auth.isLogout,adminController.loadLogin);
admin_route.post('/',adminController.verifyLogin);

admin_route.get('/home',auth.isLogin,adminController.loadDashboard);

admin_route.get('/logout',auth.isLogin,adminController.logout);

admin_route.get('/forget',auth.isLogout,adminController.forgetLoad);
admin_route.post('/forget',adminController.forgetVerify);

admin_route.get('/forget-password',auth.isLogout,adminController.forgetPasswordLoad);
admin_route.post('/forget-password',adminController.resetPassword);

admin_route.get('/add-problems',auth.isLogin,adminController.addProblemLoad);
admin_route.post('/add-problems',upload.single('image'),adminController.addProblem);

admin_route.get('/add-events',auth.isLogin,adminController.addEventLoad);
admin_route.post('/add-events',upload.single('image'),adminController.addEvent);

admin_route.get('/dashboard',auth.isLogin,adminController.adminDashboard);

admin_route.get('/new-user',auth.isLogin,adminController.newUserLoad);
admin_route.post('/new-user',upload.single('image'),adminController.addUser);

admin_route.get('/edit-user',auth.isLogin,adminController.editUserLoad);
admin_route.post('/edit-user',adminController.updateUser);

admin_route.get('/delete-user',adminController.deleteUser);
admin_route.get('/delete-problem',adminController.deleteProblem);
admin_route.get('/delete-event',adminController.deleteEvent);

admin_route.get('*',function(req,res){s
    res.redirect('/admin');
});


module.exports=admin_route;

