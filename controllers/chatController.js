const Chat = require('../models/chatModel');

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
};


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

module.exports = {
    saveChat,
    deleteChat,
    updateChat
}