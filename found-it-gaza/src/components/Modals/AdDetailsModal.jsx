import React from "react";

const AdDetailsModal = ({ open, onClose, ad, onContact }) => {
  if (!open || !ad) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden relative animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">
            {ad.title || "تفاصيل الإعلان"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Content */}
        <div>
          {/* Image */}
          <div className="w-full h-64 bg-gray-100 overflow-hidden">
            {ad.image ? (
              <img
                src={ad.image}
                className="w-full h-full object-cover"
                alt={ad.title}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                لا توجد صورة
              </div>
            )}
          </div>

          <div className="p-5 space-y-4">
            
            {/* 🔥 الحالة */}
            <div className="flex items-center gap-3">
              <span
                className={`text-xs px-3 py-1 rounded-full font-bold ${
                  ad.isResolved
                    ? "bg-gray-200 text-gray-700"
                    : ad.type === "found"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {ad.isResolved
                  ? "تم التسليم"
                  : ad.type === "found"
                  ? "موجود"
                  : "مفقود"}
              </span>

              <span className="text-xs text-gray-500">
                <i className="far fa-clock ml-1"></i>
                {ad.createdAt
                  ? new Date(ad.createdAt).toLocaleDateString("ar-EG")
                  : ""}
              </span>
            </div>

            {/* Location + Category */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>
                <i className="fas fa-map-marker-alt ml-1"></i>
                {ad.location || ""}
              </span>
              <span>
                <i className="fas fa-tag ml-1"></i>
                {ad.category || ""}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-700 leading-relaxed">
              {ad.description || "لا يوجد وصف متاح لهذا الإعلان."}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t">
              
              {/* User */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  {ad?.userId?.avatar ? (
                    <img
                      src={ad.userId.avatar}
                      alt={ad?.userId?.fullName || "مستخدم"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <i className="fas fa-user text-gray-400"></i>
                  )}
                </div>

                <span className="text-sm font-semibold text-gray-700">
                  {ad.userId?.fullName || "ناشر مجهول"}
                </span>
              </div>

              {/* 🔥 زر التواصل */}
              {!ad.isResolved ? (
                <button
                  onClick={() => onContact(ad.userId?._id)}
                  className="py-2 px-4 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-bold transition-colors"
                >
                  تواصل مع الناشر
                </button>
              ) : (
                <div className="text-sm font-bold text-gray-500">
                  تم تسليم هذا الإعلان
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdDetailsModal;