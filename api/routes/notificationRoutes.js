const router = require('express').Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/authJWT');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes pour les notifications
router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);

// Route admin pour créer des notifications
router.post('/', notificationController.createNotification);

module.exports = router;