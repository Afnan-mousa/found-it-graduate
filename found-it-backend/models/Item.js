const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    //المعلومات الاساسية 
    title: { type: String, required: true, trim: true, minlength: 5,}, 
    description: { type: String, required: true, trim: true, }, 
    type: { 
        type: String, 
        enum: ['lost', 'found'], 
        required: true ,
        lowercase: true,
        trim: true,
    },
    // 3. الفئة (Category) - كما وردت في قائمة الاختيارات عندك
    category: { 
        type: String, 
        enum: [
        "documents",
        "electronics",
        "keys",
        "wallet",
        "vehicles",
        "pets",
        "others",
      ],
        required: true ,
        lowercase: true,
      trim: true,
    },
    // 4. التفاصيل اللوجستية
    location: { type: String, required: true,trim: true, }, // المكان
    locationDetails: {
      type: String,
      default: "",
      trim: true,
    },
    date: { type: Date, required: true }, // التاريخ   
    // 5. الوسائط والتواصل
    image: { type: String ,default: "",
      trim: true,}, // سنخزن رابط الصورة هنا
    contactPhone: { type: String, required: true , trim: true, }, // رقم الموبايل للتواصل

    isResolved: { type: Boolean, default: false }, // هل تم العثور على صاحب الغرض؟
    
    // 7. ربط البلاغ بصاحبه (اختياري حالياً، ضروري لاحقاً)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Item', itemSchema);