// routes/userRoutes.js
const express = require('express');
const router = express.Router();
// استيراد الدوال من الـ controller
const { registerUser, loginUser } = require('../controllers/userController');
const { updateProfile } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

// المسارات تستدعي الدوال مباشرة
router.post('/register', registerUser);
router.post('/login', loginUser);
router.put("/profile", authMiddleware , updateProfile);

module.exports = router;