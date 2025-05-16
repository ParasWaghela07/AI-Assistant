const express = require('express');
const router = express.Router();
const {codeReview,chat,generateImage,summarizeText,fileHandler,codeGenerator} = require('../controllers/GeminiHandlers');
const {signup,login,logout,fetchAllChats} = require('../controllers/UserHandlers');
const {auth} = require('../middlewares/auth');

router.post('/codeReview',codeReview);
router.post('/chat',auth,chat);
router.post('/generateImage',generateImage);
router.post('/summarizeText',summarizeText);
router.post('/fileHandler',fileHandler);
router.post('/codeGenerator',codeGenerator);
router.get('/fetchAllChats',auth,fetchAllChats);
router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.get('/checkAuth', auth, (req, res) => {
  res.status(200).json({ message: 'Authenticated' });
});

module.exports = router;