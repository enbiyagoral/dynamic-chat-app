const User = require('../models/userModel');
const Chat = require('../models/chatModel');
const Group = require('../models/groupModel');
const Member = require('../models/memberModel');
const GroupChat = require('../models/groupChatModel');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
        const group_Id = req.body.group_Id;
        // var users = await User.find({_id: {$nin: [req.session.user._id]}});
        var users = await User.aggregate([
            {
                $lookup:{
                    from: "members",
                    localField: "_id",
                    foreignField: "userId",
                    pipeline: [
                        {
                            $match:{
                                $expr:{
                                    $and:[
                                        { $eq:[ "$groupId", new mongoose.Types.ObjectId(group_Id)]}
                                    ]
                                }
                            }
                        }
                    ],
                    as: "member"
                }
            },
            {
                $match:{
                    "_id": {
                        $nin: [new mongoose.Types.ObjectId(req.session.user._id)]
                    }
                }
            }
        ]);
        res.status(200).send({success: true, data:users})
    } catch (error) {
        res.status(400).send({success: false, msg:error.message});
    }
}

const addMembers = async(req,res)=>{
    try {
        var {members, limit, group_Id} = req.body;
        if(members === undefined){
            res.status(200).send({success: false, msg: 'Please select any one Member'});
        }else if(members.length> parseInt(limit)){
            res.status(200).send({success: false, msg: 'You can not select more than ', limit});
        }else{
            await Member.deleteMany({groupId:group_Id});

            var data = [];
            for (let i=0; i<members.length; i++){
                data.push({
                    groupId: group_Id,
                    userId: members[i],
                });
            }

            await Member.insertMany(data);
            
            res.status(200).send({success: true, msg: 'Members added succesfully'});
        }
    } catch (error) {
        res.status(400).send({success: false, msg:error.message});
    }
}

const updateChatGroup = async(req,res)=>{
    try {
        const {limit, name, groupId,lastLimit} = req.body;
        const file = req.file;

        if(parseInt(limit)<parseInt(lastLimit)){
            await Member.deleteMany({groupId});
        };

        var updateObj;
        if(file !== undefined){
            updateObj = {
                name,
                limit,
                image: 'images/'+ file.filename,
            };
        }else{
            updateObj = {
                name,
                limit
            };
        };

        await Group.findByIdAndUpdate({_id:groupId},{
            $set: updateObj
        });


        res.status(200).send({success:true, msg: 'Chat Groups Updated succesfully'});
    } catch (error) {
        res.status(400).send({success: false, msg:error.message});
    }
}

const deleteChatGroup = async(req,res)=>{
    try {
        const { groupId } = req.body;

        await Group.deleteOne({_id:groupId});
        await Member.deleteMany({groupId});

        res.status(200).send({success:true, msg: 'Chat Groups Deleted succesfully'});
    } catch (error) {
        res.status(400).send({success: false, msg:error.message});
    }
};

const shareGroup = async(req,res)=>{
    try {
        var groupData = await Group.findOne({_id: req.params.id});

        if(!groupData){
            res.render('error',{message:'404 not found'});
        }else if(req.session.user == undefined){
            res.render('error',{ message: 'You need to login to access the Share URL!'})
        }else{
            const totalMembers = await Member.find({groupId:req.params.id}).count();
            const availible = groupData.limit - totalMembers;
            const isOwner = groupData.creatorId == req.session.user._id ? true : false;
            const isJoined = await Member.find({ groupId: req.params.id, userId:req.session.user._id }).count();

            res.render('shareLink', { group: groupData, totalMembers,isOwner, isJoined, availible});
        }

    } catch (error) {
        res.status(400).send({success: false, msg:error.message});
    }
}

const joinGroup = async(req,res)=>{
    try {
        const {groupId} = req.body;
        const member = new Member({
            groupId,
            userId: req.session.user._id
        });

        await member.save();

        res.status(200).send({success:true, msg: 'Congratulations, you have joined the group succesfully'});
    } catch (error) {
        res.status(400).send({success: false, msg:error.message});
    }
};




const groupChats = async(req,res)=>{
    try {
        const myGroups = await Group.find({creatorId:req.session.user});
        const joinedGroups = await Member.find({userId:req.session.user}).populate('groupId');
        res.render('chat-group', { myGroups, joinedGroups})
    } catch (error) {
        res.status(400).send({success: false, msg:error.message});
    }
};

const saveGroupChat = async (req,res)=>{
    try {
        const { senderId, groupId, message} =  req.body;
        const chat = new GroupChat({
            senderId,
            groupId,
            message
        });

        var newChat = await chat.save();

        var cChat = await GroupChat.find({_id: newChat._id}).populate('senderId');
        res.send({success:true, chat:cChat})
    } catch (error) {
        res.status(400).send({success: false, msg:error.message});
    }
};

const loadGroupChats = async (req,res)=>{
    try {
        const { groupId } = req.body;
        const groupChats = await GroupChat.find({groupId}).populate('senderId');
        res.send({success:true, chats: groupChats})
    } catch (error) {
        res.status(400).send({success: false, msg:error.message});
    }
};

const deleteChatGroupMessage = async(req,res)=>{
    try {
        const { id } = req.body;
        await GroupChat.deleteOne({_id:id});
        res.send({success:true, msg: 'Chat deleted'})
    } catch (error) {
        res.status(400).send({success: false, msg:error.message});
    }
};

const updateGroupChat = async (req,res)=>{
    try {
        const { id, message } = req.body;
        await GroupChat.findByIdAndUpdate(id,{
            $set: {
                message
            }
        });
        res.send({success:true, msg: 'Chat Updated'});
    } catch (error) {
        res.status(400).send({success: false, msg:error.message});
    }
};

module.exports = {
    loadGroups,
    createGroup,
    addMembers,
    getMembers,
    updateChatGroup,
    deleteChatGroup,
    shareGroup,
    joinGroup,
    groupChats,
    saveGroupChat,
    loadGroupChats,
    deleteChatGroupMessage,
    updateGroupChat
}