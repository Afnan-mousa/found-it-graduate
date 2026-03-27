const Notification = require("../models/Notification");

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate("itemId", "title type category location image isResolved")
      .populate("matchedItemId", "title type category location image isResolved");

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("getMyNotifications error:", error);
    res.status(500).json({
      success: false,
      message: "فشل في جلب الإشعارات",
    });
  }
};

const getUnreadNotificationsCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("getUnreadNotificationsCount error:", error);
    res.status(500).json({
      success: false,
      message: "فشل في جلب عدد الإشعارات غير المقروءة",
    });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "الإشعار غير موجود",
      });
    }

    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك",
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: "تم تعليم الإشعار كمقروء",
      notification,
    });
  } catch (error) {
    console.error("markNotificationAsRead error:", error);
    res.status(500).json({
      success: false,
      message: "فشل في تحديث الإشعار",
    });
  }
};

module.exports = {
  getMyNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
};