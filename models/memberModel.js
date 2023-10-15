const mongoose = require('mongoose');

const memberSchema = mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
},{timestamps:true});

const memberModel = mongoose.model('Member', memberSchema);

module.exports = memberModel;