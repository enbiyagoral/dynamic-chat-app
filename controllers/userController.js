const User = require('../models/userModel');
const Chat = require('../models/chatModel');
const Group = require('../models/groupModel');
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
                res.cookie('user', JSON.stringify(user));
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
        res.clearCookie('user');
        req.session.destroy();
        return res.redirect('/');

    } catch (error) {
        console.log(error.message);
    }
}

const loadDashboard = async (req,res)=>{
    try {
        const users = await User.find({ _id: { $ne: req.session.user._id } });
        return res.render('dashboard',{user:req.session.user, users})
    } catch (error) {
        console.log(error.message);
    }
}

const saveChat = async (req,res)=>{
    try {
        const chat = new Chat({
            senderId: req.body.senderId,
            receiverId: req.body.receiverId,
            message: req.body.message
        })
        var newChat = await chat.save();
        res.status(200).send({success: true, msg: 'Chat inserted', data: newChat})
    } catch (error) {
        res.status(400).send({success: false, msg:error.message});
    }
}

const deleteChat = async (req,res)=>{
    try {
        await Chat.deleteOne({_id:req.body.id});
        res.status(200).send({success: true})

    } catch (error) {
        res.status(400).send({success: false, msg:error.message});
    }
}

const updateChat = async (req,res)=>{
    try {
        await Chat.findByIdAndUpdate({_id: req.body.id},{
            $set:{
                message: req.body.message,   
            }
        })
        res.status(200).send({success: true})
    } catch (error) {
        res.status(400).send({success: false, msg:error.message});
    }
}

const loadGroups = async(req,res)=>{
    try {
        const groups = await Group.find({creatorId : req.session.user._id});
        res.render('group', { groups });
    } catch (error) {
        res.status(400).send({success: false, msg:error.message});
    }
};

const createGroup = async(req,res)=>{
    try {
        const {name, limit } = req.body;
        const file = req.file;
        console.log(req.session.user);
        const group = new Group({
            creatorId: req.session.user,
            name,
            image: 'images/'+ file.filename,
            limit,
        });

        await group.save();
        const groups = await Group.find({creatorId : req.session.user});

        res.render('group', {message: name+' Group created Succesfully', groups});
    } catch (error) {
        res.status(400).send({success: false, msg:error.message});
    }
};

const getMembers = async(req,res)=>{      
    try {
        var users = await User.find({_id: {$nin: [req.session.user._id]}});
        res.status(200).send({success: true, data:users})
    } catch (error) {
        res.status(400).send({success: false, msg:error.message});
    }
}


module.exports = {
    register,
    registerLoad,
    loadDashboard,
    logout,
    login,
    loadLogin,
    saveChat,
    deleteChat,
    updateChat,
    loadGroups,
    createGroup,
    getMembers
}