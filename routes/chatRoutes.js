const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.post('/', authMiddleware, chatController.salvarMensagem);

router.get('/', authMiddleware, chatController.listarMensagens);

router.post(
    '/vision',
    authMiddleware,
    upload.single('imagem'),
    chatController.enviarMensagemVision
);

module.exports = router;