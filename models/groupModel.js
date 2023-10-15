const mongoose = require('mongoose');

const groupSchema = mongoose.Schema({
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    limit: {
        type: Number,
        required: true
    }
},{timestamps:true});

const groupModel = mongoose.model('Group',groupSchema);

module.exports = groupModel;