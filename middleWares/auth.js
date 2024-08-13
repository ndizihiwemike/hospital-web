
const isLogin = async (req,res,next)=>{
    try {
        if(req.session.user){
            res.render('home',{message:"Logged in already",user:req.session.user});
        }
        else{
            next();
        }
    } catch (err) {
        console.log(err.message);
        res.render('error',{error:err.message});
    }
}

const isLogout = async (req,res,next)=>{
    try {
        if(req.session.user){
            next();
        }
        else{
            res.render('home',{message:"The section you tried to access requires logging in"});
        }
    } catch (err) {
        console.log(err.message);
        res.render('error',{error:err.message});
    }
}

const isAdmin = async (req,res,next)=>{
    try {
        if(req.session.user.admin){
            next();
        }
        else{
            res.render('home',{message:"You are not an administrator."});
        }
    } catch (err) {
        console.log(err.message);
        res.render('error',{error:err.message});
    }
}

module.exports = {
    isLogin,
    isLogout,
    isAdmin
}