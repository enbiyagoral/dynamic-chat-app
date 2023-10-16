const mongoose = require('mongoose');

const groupChatSchema = new mongoose.Schema({
    
    senderId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    groupId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    },
    message: {
        type: String,
        required: true,
    }
},{timestamps:true});

const groupChatModel = mongoose.model('GroupChat', groupChatSchema);
module.exports = groupChatModel;
