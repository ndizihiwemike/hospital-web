const db = require('../modules/mongoDBApi');
const uploadToFTP = require('../modules/ftp');
const sendVMail = require('../modules/sendMail');
const bcrypt = require('bcrypt');
const fs = require('fs');
const { error } = require('console');

// const session = require('express-session');
function htmlMsg(name, email, location, message){
    var msg = `<!DOCTYPE html>
    <html>
    <head>
      <title>Inquiry from patient</title>
      <style>
        body {
          background-color: #f5f8fa;
          font-family: Arial, sans-serif;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 5px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #007bff;
          color: #fff;
          padding: 10px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          padding: 20px;
        }
        .verification-code {
          font-size: 24px;
          font-weight: bold;
          color: #007bff;
          text-align: center;
          margin-bottom: 20px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Inquiry</h1>
        </div>
        <div class="content">
          <p>Dear Doctor,</p>
          <p>I am ${name} from ${location}</p>
          <p class="verification-code">${message}</p>
          <p>Reply to this email will be sent to ${email}</p>
        </div>
        <div class="footer">
          <p>Powerered by kitarogz@gmail.com</p>
        </div>
      </div>
    </body>
    </html>
    `
    return msg
}
async function generateRandomCode() {
    const length = 10;
    let code = '';
    // Create a pool of characters from which the code will be generated
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (let i = 0; i < length; i++) {
      // Randomly pick a character from the pool
      const randomIndex = Math.floor(Math.random() * characters.length);
      const randomCharacter = characters.charAt(randomIndex);
  
      // Append the random character to the code
      code += randomCharacter;
    }
    return code;
}
  

var files;
var days;
var courses;
const forbiddenFileExtensions = ['.exe', '.bat', '.sh'];

async function getFiles(){
    return await db.readRows({},'huddypro','uploads');
}
async function getDays(){
    return await db.readRows({},'huddypro','days');
}
async function validateV(){
    files = await getFiles();
    days = await getDays();
}

async function delFiles(req){
    const files = req.files;
    await files.forEach(fil => {
      try {
        fs.unlinkSync(fil.path)
      } catch (err) {
        console.log(err.message)
      }
    });
}
const loadRegister = async (req, res)=>{
    try {
        res.render('register');
    } catch (error) {
        res.render('error',{error:error.message});
    }
}

const setPassword = async (req, res, next)=>{

}

const register = async (req, res, next)=>{
    try {
        // Encrypting password
        res.render('register')
    } catch (error) {
        console.log(error.message);
        res.render('error',{error:error.message});
    }
}

const loadLogin = async (req, res)=>{
     try {
        res.render('login');
     } catch (error) {
        res.render('error',{error:error.message});
     }
}

const login = async (req, res)=>{
    try {
        var checkUser = await db.readRow({email:req.body.email},"huddypro","users");
        if(checkUser.found){
            if(checkUser.listing.verified){
                const checkPassword = await bcrypt.compare(req.body.password,checkUser.listing.password);
                if(checkPassword){
                    req.session.user = checkUser.listing
                    // console.log(req.session.user)
                    res.redirect('/');
                }
                else{
                    res.render('login',{message:"Invalid Password"});
                }
            }else{
                res.render('emailVery',{fData:checkUser.listing})
            }
        }
        else{
            console.log(checkUser);
            res.render('login',{message:"Account doesn't exist",login:"",fData:req.body});
        }
    } catch (error) {
        console.log(error.message);
        res.render('error',{error:error.message});
    }
}

const logout = async (req, res)=>{
     try {
        req.session.destroy();
        res.redirect('/');
     } catch (error) {
        res.render('error',{message:error.message});
     }
}
const loadHome = async (req, res)=>{
    try {
        if(req.session.user){
            res.render('home',{user:req.session.user.LName});
        }
        else{
            res.render('home');
        }
    } catch (error) {
        res.render('error',{error:error.message})
    }
}

const studentCheck = async (req, res, next)=>{
    try {
        const ck = await db.readRow({studentN:req.body.studentN},'huddypro','student');
        if(ck.found){
            next();
        }
        else{
            res.render('student',{message:"Your student Number is not accepted, Check with your lecturer to add your Student Number",fData:req.body});
        }
    } catch (error) {
        res.render('error',{error:error.message});
    }
}

const studentUpload = async(req, res)=>{
    try {
        const files = req.files;
        var list= [];
        var rlist = [];
        
        if (!files || files.length === 0) {
            console.log('No files to upload');
            res.render('student',{message:"Nothing was uploaded"})//,{message:"You didnot send any files."})
        }
        else{
            await files.forEach(async(el)=>{
                const fileExt = el.originalname.slice(el.originalname.lastIndexOf('.'));
                if (forbiddenFileExtensions.includes(fileExt)) {
                    rlist.push(el.originalname)
                }else{
                    list.push(el.originalname);
                }
            });
            const ck = await db.readRow({day:req.body.day},"huddypro",'days');
            if(!ck.found){
                await db.createListing({day:req.body.day},'huddypro','days');
            }
            req.body["files"] = list;
            await db.createListing(req.body,"huddypro", "uploads");
            
            res.render('student',{message:"Uploaded with success",files:list,rfiles:rlist})//,{message:"Files added successfuly"});
        }
    } 
    catch (error) {
        res.render('error',{error:error.message});
    }
}
const pannelLoad = async (req,res)=>{
    try {
        if(req.session.user.admin){
            await validateV();
            res.render('pannel',{days:days.listings,files:files.listings,user:req.session.user});
        }else{
            res.render('pannel',{message:"This section can be accessed only by Administrators",user:""});
        }
    } catch (error) {
        res.render('error',{error:error.message});
    }
}
const sendMailVerify = async (req,res)=>{
    try {
        // const secCode = await generateRandomCode();
        // const hashSecCode = await bcrypt.hash(secCode, 10);
        // req.body.verCode = hashSecCode;
        // req.body.verified = false;
        // req.body.password = await bcrypt.hash(req.body.password, 10)
        const mailOptions = {
            from: 'Root And Vine <r0otandvine@yandex.com>',
            to: [`mikendizihiwe@gmail.com`], // Update recipients as an array for multiple recipients
            subject: `${req.body.Subject}`,
            text: "From patient",
            html: htmlMsg(req.body.Name, req.body.Email, req.body.Location, req.body.Message),
            replyTo: `${req.body.Email}`
        };
        await sendVMail.sendEmail(mailOptions);
        res.send(`Message sent to doctor. <a href="/">Go back to Home</a>`)
    } catch (error) {
        res.render('error',{error:error.message})
    }
}
const MailVerify = async (req,res)=>{
    try {
        const ck = await db.readRow({email:req.body.email},'huddypro','users');
        if(ck.found){
            const cj = await bcrypt.compare(req.body.verCode, ck.listing.verCode);
            if(cj){
                await db.updateRow({email:req.body.email},{verified:true},'huddypro','users');
                res.redirect('/');
            }
            else{
                res.render('emailVery',{fData:req.body, message:"Please check the code and try again"});
            }
        }else{
            throw new error("There was a problem please register again")
        }
    } catch (error) {
        res.render('error',{error:error.message})
    }
}

const makeAdmin = async (req, res)=>{
    try {
        const ck = await db.readRow({email:req.body.email},'huddypro','users');
        if(ck.found){
            if(ck.listing.admin){
                res.render('accounts',{user:"",message:"User is already Admin"});
            }else{
                await db.updateRow2({email:req.body.email},{admin:true},'huddypro','users');
                res.render('accounts',{user:"",message:"User is now admin"});
            }
        }
        else{
            res.render('accounts',{message:"The email is not in the database of accounts.",user:""})
        }
    } catch (error) {
        res.render('error',{error:error.message});
    }
}
const removeAdmin = async (req, res)=>{
    try {
        const ck = await db.readRow({email:req.body.email},'huddypro','users');
        if(ck.found){
            if(ck.listing.admin){
                await db.updateRow2({email:req.body.email},{admin:false},'huddypro','users');
                res.render('accounts',{user:"",message:"User is now not and admin."});
            }else{
                res.render('accounts',{user:"",message:"User is not an admin."});
            }
        }
        else{
            res.render('accounts',{message:"The email is not in the database of accounts.",user:""})
        }
    } catch (error) {
        res.render('error',{error:error.message});
    }
}

const changePassword = async (req, res)=>{
    try {
        var checkUser = await db.readRow({email:req.body.email},"huddypro","users");
        if(checkUser.found){
            const checkPassword = await bcrypt.compare(req.body.oldPass,checkUser.listing.password);
            if(checkPassword){
                const newPass = await bcrypt.hash(req.body.password, 10);
                await db.updateRow({email:req.body.email},{password:newPass},'huddypro','users')
                // console.log(req.session.user)
                res.render('accounts',{message:"Password was changed Successfully."})
            }
            else{
                res.render('accounts',{message:"Invalid old Password"});
            }
        }
        else{
            console.log(checkUser);
            res.render('login',{message:"Account doesn't exist",login:"",fData:req.body});
        }
    } catch (error) {
        console.log(error.message);
        res.render('error',{error:error.message});
    }
}

const addStudent = async (req, res)=> {
    try {
        const ck = await db.readRow({studentN:req.body.studentN},'huddypro','students');
        if(ck.found){
            res.render('error',{error:"Student is already added!"})
        }
        else{
            res.render('account')
        }
    } catch (error) {
        res.render('error',{error:error.message});
    }
}
const loadAccounts = async (req, res)=>{
    try {
        var accounts = await db.readRows({},'huddypro','users');
        res.render('accounts',{eData:accounts.listings,user:req.session.user});
    } catch (error) {
        res.render('error',{error:error.message});
    }
  }
  
module.exports = {
    register,
    loadAccounts,
    changePassword,
    addStudent,
    loadLogin,
    login,
    logout,
    loadHome,
    studentUpload,
    pannelLoad,
    sendMailVerify,
    studentCheck,
    MailVerify,
    makeAdmin,
    removeAdmin
}