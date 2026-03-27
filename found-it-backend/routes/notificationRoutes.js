const express = require("express");
const router = express.Router();

const {
  getMyNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
} = require("../controllers/notificationController");

const  protect  = require("../middleware/authMiddleware");

router.get("/", protect, getMyNotifications);
router.get("/unread-count", protect, getUnreadNotificationsCount);
router.patch("/:id/read", protect, markNotificationAsRead);

module.exports = router;