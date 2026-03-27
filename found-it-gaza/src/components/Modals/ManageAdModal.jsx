import React, { useState, useEffect } from "react";

const ManageAdModal = ({
  open,
  onClose,
  ad,
  onSave,
  onDelete,
  onMarkReturned,
}) => {
  const [form, setForm] = useState(ad || {});

  // تحديث بيانات النموذج عند تغيير الإعلان المختار
  useEffect(() => {
    setForm(ad || {});
  }, [ad]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!open) return null;

  return (
    <div
      id="manage-ad-modal"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden relative">
        {/* الرأس (Header) */}
        <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">
            إدارة: {form.title || ""}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* النموذج (Form) */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(form);
          }}
          className="p-5 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                عنوان الإعلان
              </label>
              <input
                value={form.title || ""}
                onChange={(e) => handleChange("title", e.target.value)}
                type="text"
                className="w-full border rounded-lg p-3 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                نوع المنشور
              </label>
              <select
                value={form.type || "lost"}
                onChange={(e) => handleChange("type", e.target.value)}
                className="w-full border rounded-lg p-3 focus:outline-none focus:border-blue-500"
              >
                <option value="lost">مفقود</option>
                <option value="found">موجود</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                حالة الإعلان
              </label>
              <select
                value={form.isResolved ? "resolved" : "active"}
                onChange={(e) =>
                  handleChange("isResolved", e.target.value === "resolved")
                }
                className="w-full border rounded-lg p-3 focus:outline-none focus:border-blue-500"
              >
                <option value="active">نشط</option>
                <option value="resolved">تم الحل</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                التصنيف
              </label>
              <input
                value={form.category || ""}
                onChange={(e) => handleChange("category", e.target.value)}
                type="text"
                className="w-full border rounded-lg p-3 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                المدينة
              </label>
              <input
                value={form.location || ""}
                onChange={(e) => handleChange("location", e.target.value)}
                type="text"
                className="w-full border rounded-lg p-3 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">
                الوصف
              </label>
              <textarea
                value={form.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                rows="3"
                className="w-full border rounded-lg p-3 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">
                الصورة
              </label>
              <div className="flex items-center gap-4">
                <img
                  src={form.image || ""}
                  alt="preview"
                  className="w-24 h-24 object-cover rounded border bg-gray-100"
                />
                <input
                  type="file"
                  accept="image/*"
                  className="border p-2 rounded-md text-sm"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => handleChange("image", reader.result);
                    reader.readAsDataURL(file);
                  }}
                />
              </div>
            </div>
          </div>

          {/* أزرار التحكم (Footer) */}
          <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("هل أنت متأكد من حذف هذا البلاغ؟")) {
                    onDelete(form._id); 
                  }
                }}
                className="py-2 px-4 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
              >
                <i className="fas fa-trash-alt"></i> حذف
              </button>
              <button
                type="button"
                onClick={() => onMarkReturned(form._id)}
                className="py-2 px-4 border border-green-600 text-green-600 rounded-lg hover:bg-green-50"
              >
                <i className="fas fa-check"></i> تم التسليم
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 border rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <i className="fas fa-save"></i> حفظ التعديلات
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageAdModal;
