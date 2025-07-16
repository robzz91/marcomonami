const router = require('express').Router();
const messageController = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/authJWT');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes messages
router.get('/conversations', messageController.getConversations);
router.get('/unread-count', messageController.getUnreadCount);
router.get('/conversation/:interlocuteurId', messageController.getMessages);
router.post('/send', messageController.sendMessage);
router.patch('/read/:expediteurId', messageController.markAsRead);
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router;