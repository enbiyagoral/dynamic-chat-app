const express = require('express');
const router = express.Router();
const { isLogin, isLogout} = require('../middlewares/auth');
const multer = require('multer');
const storage = multer.diskStorage({
    destination : function(req, file, cb){
        cb(null, path.join(__dirname,'../public/images'));
    },
    filename : function(req, file, cb){
        const name =  Date.now() + '-' + file.originalname;
        cb(null, name)
    }
});
const {
    loadGroups, 
    createGroup, 
    getMembers, 
    addMembers,
    updateChatGroup, 
    deleteChatGroup, 
    shareGroup, 
    joinGroup,
    groupChats,
    saveGroupChat,
    loadGroupChats,
    deleteChatGroupMessage,
    updateGroupChat
} = require('../controllers/groupController');
const path = require('path');

const upload = multer({storage: storage});

router.get('/', isLogin, loadGroups);
router.post('/', [isLogin, upload.single('image')], createGroup);

router.post('/get-members', isLogin, getMembers);
router.post('/add-members', isLogin, addMembers);

router.post('/update-chat-group', [isLogin, upload.single('image')], updateChatGroup)
router.post('/delete-chat-group',isLogin, deleteChatGroup)
router.get('/share-group/:id', shareGroup);
router.post('/join-group', isLogin, joinGroup);
router.get('/group-chat', isLogin, groupChats);
router.post('/group-chat-save', isLogin, saveGroupChat);
router.post('/load-group-chats',isLogin, loadGroupChats);
router.post('/delete-group-chat',isLogin, deleteChatGroupMessage);
router.post('/update-group-chat',isLogin, updateGroupChat);

module.exports = router