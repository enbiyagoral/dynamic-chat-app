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
router.post('/register', upload.single("image"), userController.register)

router.get('/', isLogout ,userController.loadLogin);
router.post('/', userController.login);
router.get('/logout', isLogin, userController.logout);
router.get('/dashboard', isLogin, userController.loadDashboard);

router.post('/save-chat', userController.saveChat);


module.exports = router