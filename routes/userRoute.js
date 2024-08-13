const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const con = require('./../config.json');
const session = require('express-session');
const uploadToFTP = require('../modules/ftp');

const user_route = express();

const bodyParser = require('body-parser');
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}));

// user_route.use(cors({
//     origin: "https://hiweightechsystemsltd.onrender.com",
//     methods: "*",
//     allowedHeaders:"*"
// }));
var accounts = [];

user_route.use(session({
  secret: con.sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Note: Change to 'true' if using HTTPS
    maxAge: 30 * 60 * 1000 // Cookie will expire in 30 minutes (in milliseconds)
  }
}));

user_route.set('view engine','ejs');
user_route.set('views','./views');
user_route.use(express.static(path.join(__dirname, '../public')));

// const storage = multer.diskStorage({
//   destination:function(req, file, cb){
//     cb(null,'uploads/')
//   },
//   filename:function(req,file,cb){
//     const n = Date.now()+'-'+file.originalname;
//     cb(null,n)
//   }
// });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';// 
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const n = file.originalname;
    cb(null, n);
  }
});



const upload = multer({storage:storage});
const userController = require('../controllers/userController');
// const auth = require('./../middleWares/auth');

// handeling registration
// user_route.get('/register', auth.isLogin ,(req,res)=>{
//   res.render("register");
// });
// user_route.post('/register',upload.any(), userController.register);

// // handling login
// user_route.get('/login',auth.isLogin, userController.loadLogin);
// user_route.post('/login', userController.login);

// // handling logouts
// user_route.get('/logout',auth.isLogout, userController.logout)

// user_route.get('/dashboard',userController.loadDashboard);
// user_route.get('/',userController.loadHome);
// user_route.get('/login',auth.isLogin, async (req, res)=>{
//   res.render('login');
// });
// user_route.get('/logout', auth.isLogout, userController.logout)

// user_route.post('/login', auth.isLogin, userController.login);

// user_route.get('/register', auth.isLogin, async (req, res)=>{
//  res.render('register'); 
// });
// user_route.post('/register',auth.isLogin, userController.sendMailVerify);

// user_route.get('/account',auth.isLogout,auth.isAdmin, userController.loadAccounts);

// user_route.get('/student', (req, res)=>{
//   res.render('student',{courses:[{name:"Programing"},{name:"other Courses"}]});
// });
// user_route.post('/student',upload.any(),uploadToFTP,userController.studentUpload);

// user_route.get('/pannel',auth.isLogout,auth.isAdmin, userController.pannelLoad);

// user_route.post('/makeAdmin',auth.isLogout,auth.isAdmin,userController.makeAdmin);
// user_route.post('/removeAdmin',auth.isLogout,auth.isAdmin,userController.removeAdmin);
// user_route.post('/changePassword',auth.isLogout,auth.isAdmin, userController.changePassword);

// user_route.get('/keepAlive', (req, res)=>{
//   console.log('Status checked, clear');
//   res.send("hlo");
// });
user_route.post('/sendData',userController.sendMailVerify)
// async (req, res, next)=>{
//   try {
//     console.log(req.body)
//     res.send("success")
//   } catch (err) {
//     res.render("Error",{error:err.message})
//   }
// })

module.exports = user_route;