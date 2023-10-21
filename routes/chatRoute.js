const express = require('express');
const router = express.Router();
const {saveChat, deleteChat, updateChat} = require('../controllers/chatController');

router.post('/save-chat', saveChat);
router.post('/delete-chat', deleteChat);
router.post('/update-chat', updateChat);

module.exports = router