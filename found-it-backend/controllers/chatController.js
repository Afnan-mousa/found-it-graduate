const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const getChatNotifications = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const conversations = await Conversation.find({
      participants: currentUserId,
    }).select("_id participants");

    const conversationIds = conversations.map((c) => c._id);

    const unreadMessages = await Message.find({
      conversationId: { $in: conversationIds },
      sender: { $ne: currentUserId },
      isRead: false,
    })
      .populate("sender", "fullName avatar")
      .sort({ createdAt: -1 });

    const latestByConversation = [];
    const seen = new Set();

    for (const msg of unreadMessages) {
      const convId = msg.conversationId.toString();
      if (seen.has(convId)) continue;
      seen.add(convId);

      latestByConversation.push({
        conversationId: convId,
        senderName: msg.sender?.fullName || "مستخدم",
        senderAvatar: msg.sender?.avatar || "",
        text: msg.text,
        createdAt: msg.createdAt,
      });
    }

    return res.json({
      success: true,
      notifications: latestByConversation,
    });
  } catch (err) {
    console.error("getChatNotifications error:", err);
    return res.status(500).json({
      success: false,
      message: "فشل جلب الإشعارات",
    });
  }
};

// بدء محادثة أو جلب الموجودة
const startConversation = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        message: "معرف المستخدم الآخر مطلوب",
      });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, otherUserId], $size: 2 },
    }).populate("participants", "fullName email avatar");

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, otherUserId],
      });

      conversation = await Conversation.findById(conversation._id).populate(
        "participants",
        "fullName email avatar"
      );
    }

    return res.json({
      success: true,
      conversation,
    });
  } catch (err) {
    console.error("startConversation error:", err);
    return res.status(500).json({
      success: false,
      message: "فشل بدء المحادثة",
    });
  }
};

// جلب كل محادثات المستخدم
const getMyConversations = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const conversations = await Conversation.find({
      participants: currentUserId,
    })
      .populate("participants", "fullName email avatar")
      .sort({ lastMessageAt: -1 });

    return res.json({
      success: true,
      conversations,
    });
  } catch (err) {
    console.error("getMyConversations error:", err);
    return res.status(500).json({
      success: false,
      message: "فشل جلب المحادثات",
    });
  }
};

// جلب رسائل محادثة
const getMessages = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { id } = req.params;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "المحادثة غير موجودة",
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === currentUserId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك",
      });
    }

    const messages = await Message.find({ conversationId: id })
      .populate("sender", "fullName email avatar")
      .sort({ createdAt: 1 });

    return res.json({
      success: true,
      messages,
    });
  } catch (err) {
    console.error("getMessages error:", err);
    return res.status(500).json({
      success: false,
      message: "فشل جلب الرسائل",
    });
  }
};

// إرسال رسالة
const sendMessage = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "نص الرسالة مطلوب",
      });
    }

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "المحادثة غير موجودة",
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === currentUserId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك",
      });
    }

    const message = await Message.create({
      conversationId: id,
      sender: currentUserId,
      text: text.trim(),
    });

    conversation.lastMessage = text.trim();
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "fullName email avatar"
    );

    const io = req.app.get("io");

    const receiverId = conversation.participants.find(
      (p) => p.toString() !== currentUserId
    );

    if (receiverId) {
      io.to(receiverId.toString()).emit("new_message", {
        conversationId: conversation._id,
        text: populatedMessage.text,
        createdAt: populatedMessage.createdAt,
        sender: {
          _id: populatedMessage.sender._id,
          fullName: populatedMessage.sender.fullName,
          avatar: populatedMessage.sender.avatar || "",
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (err) {
    console.error("sendMessage error:", err);
    return res.status(500).json({
      success: false,
      message: "فشل إرسال الرسالة",
    });
  }

};
  

// تعليم الرسائل كمقروءة
const markMessagesAsRead = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { id } = req.params;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "المحادثة غير موجودة",
      });
    }

    await Message.updateMany(
      {
        conversationId: id,
        sender: { $ne: currentUserId },
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    return res.json({
      success: true,
      message: "تم تعليم الرسائل كمقروءة",
    });
  } catch (err) {
    console.error("markMessagesAsRead error:", err);
    return res.status(500).json({
      success: false,
      message: "فشل تحديث حالة القراءة",
    });
  }
};

// عدد الرسائل غير المقروءة
const getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const count = await Message.countDocuments({
      sender: { $ne: currentUserId },
      isRead: false,
      conversationId: {
        $in: (
          await Conversation.find({ participants: currentUserId }).select("_id")
        ).map((c) => c._id),
      },
    });

    return res.json({
      success: true,
      count,
    });
  } catch (err) {
    console.error("getUnreadCount error:", err);
    return res.status(500).json({
      success: false,
      message: "فشل جلب عدد الرسائل غير المقروءة",
    });
  }
};

module.exports = {
  startConversation,
  getMyConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadCount,
  getChatNotifications,
};