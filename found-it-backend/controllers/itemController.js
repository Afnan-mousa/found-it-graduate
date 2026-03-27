// controllers/itemController.js
const Item = require('../models/Item');
const checkItemMatches = require("../utils/checkItemMatches");

// إضافة غرض جديد (مفقود أو موجود)
const addItem = async (req, res) => {
    try {
        const { title, description, location, locationDetails, category, type, image, date, contactPhone } = req.body;
        if (!title || 
            !description || 
            !location ||
            !category ||
            !type ||
            !date ||
            !contactPhone) {
            return res.status(400).json({success: false, message: "يرجى ملء جميع الحقول الإلزامية" });
        }

        if (title.trim().length < 5) {
            return res.status(400).json({success: false, message: "العنوان قصير جداً" });
        }
               
        const normalizedType = String(type).trim().toLowerCase();
        const normalizedCategory = String(category).trim().toLowerCase();

        const newItem = new Item({
            title: title.trim(),
            description: description.trim(),
            location: location.trim(),
            locationDetails: locationDetails || "",
            category: normalizedCategory,
            type: normalizedType,
            image: image || "",
            date,
            contactPhone: contactPhone.trim(),
            userId: req.user.id,
        });
        const savedItem = await newItem.save();
        
        const io = req.app.get("io");
        await checkItemMatches(newItem, io);

        const populatedItem = await Item.findById(savedItem._id).populate(
            "userId",
            "fullName email phone avatar"
        );

        res.status(201).json({
            success: true,
            message: "تمت إضافة الإعلان بنجاح",
            item: populatedItem
        });
    } catch (err) {
        console.error("Error adding item:", err);
        res.status(400).json({ 
            success: false, 
            message: "فشل في إضافة الإعلان", 
            error: err.message 
        });
    }
};

// جلب جميع الأغراض
const getAllItems = async (req, res) => {
    try {
        const { type, category } = req.query;
        const query = {};

        if (type && type !== "all"){
           query.type = type.toLowerCase();
        }

        if (category) {
          query.category = category.toLowerCase();
        }
        
        console.log("getAllItems query:", query)
        const items = await Item.find(query)
        .populate("userId" , "fullName email phone avatar")
          .sort({ isResolved: 1, createdAt: -1 });

        console.log("items count:", items.length);
        res.status(200).json(items);
    } catch (err) {
        res.status(500).json({
          success: false, 
          message: "فشل في جلب الإعلانات", 
          error: err.message 
        });
    }
};

// جلب إعلان واحد بالـ ID
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      "userId",
      "fullName email phone avatar"
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "الإعلان غير موجود",
      });
    }

    res.json(item);
  } catch (err) {
    console.error("Error fetching item by id:", err);
    res.status(500).json({
      success: false,
      message: "فشل في جلب الإعلان",
      error: err.message,
    });
  }
};

// جلب إعلانات المستخدم الحالي
const getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ userId: req.user.id })
      .populate("userId", "fullName email phone avatar")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    console.error("Error fetching my items:", err);
    res.status(500).json({
      success: false,
      message: "فشل في جلب منشورات المستخدم",
      error: err.message,
    });
  }
};

// تحديث إعلان
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "الإعلان غير موجود",
      });
    }

    if (item.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بتعديل هذا الإعلان",
      });
    }
    const {
      title,
      description,
      location,
      category,
      type,
      image,
      date,
      contactPhone,
      isResolved,
    } = req.body;

    if (title !== undefined) item.title = title.trim();
    if (description !== undefined) item.description = description.trim();
    if (location !== undefined) item.location = location.trim();
    if (category !== undefined) item.category = String(category).trim().toLowerCase();
    if (type !== undefined) item.type = String(type).trim().toLowerCase();
    if (image !== undefined) item.image = image;
    if (date !== undefined) item.date = date;
    if (contactPhone !== undefined) item.contactPhone = contactPhone.trim();
    if (isResolved !== undefined) item.isResolved = isResolved;

    const updatedItem = await item.save();

    const populatedItem = await Item.findById(updatedItem._id).populate(
      "userId",
      "fullName email phone avatar"
    );

    res.json({
      success: true,
      message: "تم تحديث الإعلان بنجاح",
      item: populatedItem,
    });
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).json({
      success: false,
      message: "فشل في تحديث الإعلان",
      error: err.message,
    });
  }
};

// حذف إعلان
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "الإعلان غير موجود",
      });
    }

    if (item.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بحذف هذا الإعلان",
      });
    }

    await Item.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "تم حذف البلاغ بنجاح",
    });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({
      success: false,
      message: "فشل في حذف الإعلان",
      error: err.message,
    });
  }
};

// تحديث الحالة إلى "تم التسليم"
const markItemAsReturned = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "الإعلان غير موجود",
      });
    }

    if (item.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بتحديث هذا الإعلان",
      });
    }

    item.isResolved = true;
    await item.save();

    res.json({
      success: true,
      message: "تم تحديث حالة الإعلان",
      item,
    });
  } catch (err) {
    console.error("Error marking item as returned:", err);
    res.status(500).json({
      success: false,
      message: "فشل في تحديث الحالة",
      error: err.message,
    });
  }
};

module.exports = {
  addItem,
  getAllItems,
  getItemById,
  getMyItems,
  updateItem,
  deleteItem,
  markItemAsReturned,
};