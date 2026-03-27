import React, { useState, useRef } from 'react';
import { createPost } from "../services/api";
import{LOCATION_OPTIONS} from "../data/locations";

const AddPostPage = ({ isAuthenticated, onRequireLogin, onPublished }) => {
  const [postType, setPostType] = useState("lost");
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ حالة للتحميل أثناء الإرسال
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
    date: "",
    contactPhone: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFiles = (files) => {
    const file = files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      onRequireLogin?.();
      return;
    }

    setIsSubmitting(true);

    try {
      const postData = {
        title: form.title,
        category: form.category,
        description: form.description,
        location: form.location,
        date: form.date,
        contactPhone: form.contactPhone,
        type: postType,
        image: imagePreview || "",
      };
      console.log("postData:", postData);
      const response = await createPost(postData);

      if (response.status === 201) {
        alert("تمت الإضافة بنجاح");
        onPublished?.(response.data.item);

        setForm({
          title: "",
          category: "",
          description: "",
          location: "",
          date: "",
          contactPhone: "",
        });
        setImagePreview(null);
        setPostType("lost");
      }
    }catch (error) {
      console.error("خطأ أثناء النشر:", error.response?.data || error);
      alert(error?.response?.data?.message || error.response?.data?.error || "حدث خطأ أثناء النشر");
    } finally {
      setIsSubmitting(false);
    }

};

  return (
    <section id="add-post-page" className="page-section bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            إضافة إعلان جديد
          </h2>

          <form id="addPostForm" onSubmit={handleSubmit}>
            {/* 1. اختيار نوع الإعلان */}
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2">نوع الإعلان</label>
              <div className="flex gap-4">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="lost"
                    checked={postType === "lost"}
                    onChange={() => setPostType("lost")}
                    className="peer sr-only"
                  />
                  <div className="text-center py-3 border-2 rounded-lg peer-checked:border-red-500 peer-checked:bg-red-50 hover:bg-gray-50 transition duration-200">
                    <i className="fas fa-search mb-1 text-red-500"></i>
                    <div className="font-bold text-gray-700">مفقود</div>
                  </div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="found"
                    checked={postType === "found"}
                    onChange={() => setPostType("found")}
                    className="peer sr-only"
                  />
                  <div className="text-center py-3 border-2 rounded-lg peer-checked:border-green-500 peer-checked:bg-green-50 hover:bg-gray-50 transition duration-200">
                    <i className="fas fa-hand-holding-heart mb-1 text-green-500"></i>
                    <div className="font-bold text-gray-700">موجود</div>
                  </div>
                </label>
              </div>
            </div>

            {/* 2. عنوان الإعلان والتصنيف */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">عنوان الإعلان</label>
                <input
                  type="text"
                  name="title" // ✅ تم التعديل
                  required
                  value={form.title}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="مثال: فقدت محفظة سوداء" // ✅ تم التعديل
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">التصنيف</label>
                <select 
                  name="category" 
                  required
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:border-blue-500 appearance-none bg-white">
                  <option value="">اختر التصنيف</option>
                  <option value="documents">وثائق وهويات</option>
                  <option value="electronics">أجهزة إلكترونية</option>
                  <option value="keys">مفاتيح</option>
                  <option value="wallet">محفظة</option>
                  <option value="vehicles">مركبات</option>
                  <option value="pets">حيوانات</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
            </div>

            {/* 3. الوصف التفصيلي */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">وصف تفصيلي</label>
              <textarea
                name="description" // ✅ تم التعديل
                value={form.description}
                onChange={handleChange}
                className="w-full border rounded-lg p-3 focus:outline-none focus:border-blue-500"
                rows="4"
                placeholder="اكتب تفاصيل تساعد في التعرف على الغرض..." // ✅ تم التعديل
              ></textarea>
            </div>

            {/* 4. المكان والتاريخ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">المكان</label>
                <select
                  type="text"
                  name="location" // ✅ تم التعديل
                  value={form.location}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:border-blue-500"
                  required 
                  >
                    <option value="">اختر المنطقة</option>
                      {LOCATION_OPTIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  تفاصيل الموقع
                </label>
                <input
                  type="text"
                  name="locationDetails"
                  value={form.locationDetails}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3"
                  placeholder="مثال: قرب دوار السرايا"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ الفقد/العثور</label>
                <input
                  type="date"
                  name="date" // ✅ تم التعديل
                  value={form.date}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:border-blue-500"
                />
              </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                </label>
                  رقم التواصل
                <input
                  type="text"
                  name="contactPhone"
                  value={form.contactPhone}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:border-blue-500"
                  placeholder="أدخل رقم التواصل"
                  required
                />
            </div>

            {/* 5. رفع الصورة */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-2">صورة الغرض (اختياري)</label>
              <div 
                onClick={() => fileInputRef.current.click()}
                onDragOver={(e) => { 
                  e.preventDefault(); 
                  e.stopPropagation(); }}
                onDrop={(e) => { 
                  e.preventDefault(); 
                  e.stopPropagation(); 
                  handleFiles(e.dataTransfer.files);
                }}
                className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition cursor-pointer group relative overflow-hidden 
                  ${imagePreview ? 'border-blue-400' : ''}`}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-48 mx-auto rounded-lg shadow-sm" />
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setImagePreview(null); }} 
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
                    >
                      <i className="fas fa-times px-1"></i>
                    </button>
                  </div>
                ) : (
                  <>
                    <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2 group-hover:text-blue-500 transition-colors"></i>
                    <p className="text-gray-500 text-sm">اضغط لرفع صورة أو اسحب الصورة هنا</p>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => handleFiles(e.target.files)} 
                />
              </div>
            </div>

            {/* زر النشر */}
            <button
              type="submit"
              disabled={isSubmitting} // ✅ تعطيل الزر أثناء الإرسال
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
             {isSubmitting ? "جاري النشر..." : "نشر الإعلان"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AddPostPage;
