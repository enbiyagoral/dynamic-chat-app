const User = require('../models/userModel');
const bcrypt = require('bcrypt');


const registerLoad = async (req,res)=>{
    try {
        res.render('register');
    } catch (error) {
        
    }
};

const register = async (req,res)=>{
    try {
        const {name, email, password} = req.body;
        const file = req.file;
        console.log(file);
        const passwordHash = await bcrypt.hash(password,10);

        const user = new User({
            name,
            email,
            image: 'images/'+file.filename,
            password: passwordHash
        })

        await user.save();

        res.render('register', { message: 'Registration has beend completed'});

    } catch (error) {
        console.log(error.message);
    }
};

const loadLogin = async (req,res)=>{
    try {
        res.render('login');

    } catch (error) {
        console.log(error.message);
    }
}

const login = async (req,res)=>{
    try {
        const { email, password } = req.body;
        const user = await User.findOne({email});
        if(user){
            const passwordMatch = await bcrypt.compare(password,user.password);
            if (passwordMatch) {
                req.session.user = user;
                return res.redirect('/dashboard');
            }else{
                return res.render(login, { message : 'Email and password is incorrect!'})
            }
            
        }else{
            return res.render(login, { message : 'Email and password is incorrect!'})
        }
    } catch (error) {
        console.log(error.message);
    }
}

const logout = async (req,res)=>{
    try {

        req.session.destroy();
        return res.redirect('/');

    } catch (error) {
        console.log(error.message);
    }
}

const loadDashboard = async (req,res)=>{
    try {
        const users = await User.find({_id: req.session.user._id})
        return res.render('dashboard',{user:req.session.user, users})
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    register,
    registerLoad,
    loadDashboard,
    logout,
    login,
    loadLogin
}