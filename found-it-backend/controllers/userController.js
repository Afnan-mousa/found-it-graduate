  // controllers/userController.js
  const User = require('../models/User');
  const jwt = require('jsonwebtoken');
  const bcrypt = require('bcryptjs');

  const createToken = (user) => {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
  };

  // 1. منطق تسجيل مستخدم جديد (Sign Up)
  const registerUser = async (req, res) => {
      try {
          const { fullName, email, password, phone } = req.body;
          
          if (!fullName || !email || !password) {
          return res.status(400).json({
              success: false,
              message: "الاسم الكامل والبريد الإلكتروني وكلمة المرور مطلوبة",
          });
          }

          const normalizedEmail = email.trim().toLowerCase();

          const existingUser = await User.findOne({ email: normalizedEmail  });
          if (existingUser) {
          return res.status(400).json({
              success: false,
              message: "البريد الإلكتروني مسجل مسبقاً",
          });
          }

          const newUser = new User({
          fullName: fullName.trim(),
          email: normalizedEmail,
          password,
          phone: phone?.trim() || "",
          });

          await newUser.save();
          
          const token = createToken(newUser);
          
          return res.status(201).json({
          success: true,
          message: "تم إنشاء الحساب بنجاح",
          token,
          user: {
              id: newUser._id,
              fullName: newUser.fullName,
              email: newUser.email,
              phone: newUser.phone || "",
              avatar: newUser.avatar || "",
              location: newUser.location || "",
            },
          });
      } catch (err) {
          console.error("Register error:", err);
          res.status(400).json({success: false, message: err.message || "فشل في إنشاء الحساب" });
      }
  };

  // 2. منطق تسجيل الدخول (Login) مع إنشاء JWT
  const loginUser = async (req, res) => {
      try {
          const { email, password } = req.body;
          console.log("LOGIN BODY:", req.body);

          if (!email || !password) {
          return res.status(400).json({
              success: false,
              message: "البريد الإلكتروني وكلمة المرور مطلوبان",
          });
          }
          const normalizedEmail = email.trim().toLowerCase();
          console.log("NORMALIZED EMAIL:", normalizedEmail);

          const user = await User.findOne({ email: normalizedEmail });
          console.log("USER FOUND:", !!user);

          if (!user) {
          return res.status(401).json({
              success: false,
              message: "خطأ في البريد الإلكتروني أو كلمة المرور",
          });
          }
          const isMatch = await bcrypt.compare(password, user.password);
          console.log("PASSWORD MATCH:", isMatch);
          console.log("STORED PASSWORD:", user.password);

          if (!isMatch) {
          return res.status(401).json({
              success: false,
              message: "خطأ في البريد الإلكتروني أو كلمة المرور",
          });
          }

          const token = createToken(user);

          return res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone || "",
          avatar: user.avatar || "",
          location: user.location || "",
        },
      });
      } catch (err) {
          console.error("Login error:", err);
          res.status(500).json({success: false, message: err.message });
      }
  };

  const updateProfile = async (req, res) => {
    try {
      const userId = req.user.id; // من التوكن

      const { fullName, avatar, location } = req.body;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          ...(fullName !== undefined ? { fullName } : {}),
          ...(avatar !== undefined ? { avatar } : {}),
          ...(location !== undefined ? { location } : {}),
        },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "المستخدم غير موجود",
        });
      }

      return res.json({
        success: true,
        message: "تم تحديث الملف الشخصي",
        user: {
          id: updatedUser._id,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          phone: updatedUser.phone || "",
          avatar: updatedUser.avatar || "",
          location: updatedUser.location || "",
        },
      });
    } catch (err) {
      console.error("Update profile error:", err);
      return res.status(500).json({
        success: false,
        message: "فشل تحديث الملف الشخصي",
      });
    }
  };

  module.exports = { registerUser, loginUser, updateProfile };