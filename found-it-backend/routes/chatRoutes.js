const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  startConversation,
  getMyConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadCount,
  getChatNotifications,
} = require("../controllers/chatController");

router.post("/start", authMiddleware, startConversation);
router.get("/", authMiddleware, getMyConversations);
router.get("/unread-count", authMiddleware, getUnreadCount);
router.get("/notifications", authMiddleware, getChatNotifications);
router.get("/:id/messages", authMiddleware, getMessages);
router.post("/:id/messages", authMiddleware, sendMessage);
router.put("/:id/read", authMiddleware, markMessagesAsRead);

module.exports = router;