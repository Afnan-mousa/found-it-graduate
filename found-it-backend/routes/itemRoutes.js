const express = require('express');
const router = express.Router();

const Item = require('../models/Item');
const authMiddleware = require("../middleware/authMiddleware");
const {
  addItem,
  getAllItems,
  getItemById,
  getMyItems,
  updateItem,
  deleteItem,
  markItemAsReturned,
} = require("../controllers/itemController");

// جلب جميع الإعلانات
router.get('/', getAllItems);

// جلب إعلانات المستخدم الحالي
router.get('/my-posts', authMiddleware, getMyItems);

// جلب إعلان واحد
router.get('/:id', getItemById);

// إضافة إعلان جديد
router.post('/', authMiddleware, addItem);

// تحديث إعلان
router.put("/:id", authMiddleware, updateItem);

// حذف إعلان
router.delete("/:id", authMiddleware, deleteItem);

// تحديث الحالة إلى "تم التسليم"
router.patch("/:id/return", authMiddleware, markItemAsReturned);

module.exports = router;