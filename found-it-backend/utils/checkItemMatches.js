const Notification = require("../models/Notification");
const Item = require("../models/Item");

const normalizeText = (value = "") =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

const buildMatchKey = (itemA, itemB) => {
  return [itemA._id.toString(), itemB._id.toString()].sort().join("_");
};

const checkItemMatches = async (newItem, io = null) => {
  try {
    if (!newItem || newItem.isResolved) return;

    const normalizedLocation = normalizeText(newItem.location);
    const normalizedCategory = normalizeText(newItem.category);

    const oppositeType = newItem.type === "lost" ? "found" : "lost";

    const candidateItems = await Item.find({
      _id: { $ne: newItem._id },
      userId: { $ne: newItem.userId },
      type: oppositeType,
      isResolved: false,
    }).populate("userId", "fullName avatar");

    for (const candidate of candidateItems) {
      const sameLocation =
        normalizeText(candidate.location) === normalizedLocation;

      const sameCategory =
        normalizeText(candidate.category) === normalizedCategory;

      if (!sameLocation || !sameCategory) continue;

      const matchKey = buildMatchKey(newItem, candidate);

      const existing = await Notification.findOne({
        type: "item_match",
        matchKey,
      });

      if (existing) continue;

      const title = "قد يوجد تطابق لمنشورك";
      const bodyForNewItem = `وجدنا منشورًا مشابهًا في نفس المكان ونفس التصنيف.`;
      const bodyForCandidate = `وجدنا منشورًا جديدًا قد يتطابق مع إعلانك.`;

      const createdNotifications = await Notification.insertMany([
        {
          userId: newItem.userId,
          type: "item_match",
          title,
          body: bodyForNewItem,
          itemId: newItem._id,
          matchedItemId: candidate._id,
          matchKey,
        },
        {
          userId: candidate.userId._id,
          type: "item_match",
          title,
          body: bodyForCandidate,
          itemId: candidate._id,
          matchedItemId: newItem._id,
          matchKey,
        },
      ]);

      if (io) {
        io.to(newItem.userId.toString()).emit("notification:new", {
          _id: createdNotifications[0]._id,
          type: "item_match",
          title,
          body: bodyForNewItem,
          itemId: newItem._id,
          matchedItemId: candidate._id,
          isRead: false,
          createdAt: createdNotifications[0].createdAt,
        });

        io.to(candidate.userId._id.toString()).emit("notification:new", {
          _id: createdNotifications[1]._id,
          type: "item_match",
          title,
          body: bodyForCandidate,
          itemId: candidate._id,
          matchedItemId: newItem._id,
          isRead: false,
          createdAt: createdNotifications[1].createdAt,
        });
      }
    }
  } catch (error) {
    console.error("checkItemMatches error:", error);
  }
};

module.exports = checkItemMatches;