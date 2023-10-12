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

module.exports = {
    register,registerLoad
}