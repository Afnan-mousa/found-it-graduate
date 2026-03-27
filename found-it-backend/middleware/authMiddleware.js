// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // الحصول على التوكن من الـ Header
  const authHeader  = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "لا يوجد توكن، غير مصرح لك",
    });
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({success: false, message: 'التوكن غير صالح' });
  }
};

module.exports = authMiddleware ;