const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    message: {
        type: String,
        required: true
    }
},{timestamps:true});

const chatModel = mongoose.model('Chat',chatSchema);

module.exports = chatModel;