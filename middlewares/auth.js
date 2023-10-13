const isLogin = async(req,res,next)=>{
    try {
        if (req.session.user) {
            next();
        } else {
            res.redirect('/')
        }
    } catch (error) {
        console.log(error);
    }
}

const isLogout = async(req,res,next)=>{
    try {
        if (req.session.user) {
           return res.redirect('/dashboard');
        } 
        next();
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    isLogin, 
    isLogout
}