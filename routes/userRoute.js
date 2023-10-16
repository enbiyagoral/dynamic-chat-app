const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const userController = require('../controllers/userController');
const storage = multer.diskStorage({
    destination : function(req, file, cb){
        cb(null, path.join(__dirname,'../public/images'));
    },
    filename : function(req, file, cb){
        const name =  Date.now() + '-' + file.originalname;
        cb(null, name)
    }
});
const upload = multer({storage: storage})
const { isLogin, isLogout} = require('../middlewares/auth');

router.get('/register', isLogout, userController.registerLoad)
router.post('/register', [isLogin, upload.single('image')], userController.register)

router.get('/', isLogout ,userController.loadLogin);
router.post('/', userController.login);
router.get('/logout', isLogin, userController.logout);
router.get('/dashboard', isLogin, userController.loadDashboard);

router.post('/save-chat', userController.saveChat);
router.post('/delete-chat', userController.deleteChat);
router.post('/update-chat', userController.updateChat);

router.get('/groups', isLogin, userController.loadGroups);
router.post('/groups', [isLogin, upload.single('image')], userController.createGroup);

router.post('/get-members', isLogin, userController.getMembers);
router.post('/add-members', isLogin, userController.addMembers);

router.post('/update-chat-group', [isLogin, upload.single('image')],userController.updateChatGroup)
router.post('/delete-chat-group',isLogin, userController.deleteChatGroup)
router.get('/share-group/:id', userController.shareGroup);
router.post('/join-group', isLogin, userController.joinGroup);
router.get('/group-chat', isLogin, userController.groupChats);
router.post('/group-chat-save', isLogin, userController.saveGroupChat);

module.exports = router