import React from "react";

const ErrorOverlay = ({ error, onClose, onCopy, onReset }) => {
  const show = !!error;

  return (
    <div
      id="error-overlay"
      className={`fixed inset-0 bg-black/60 items-center justify-center z-[100] ${show ? "flex" : "hidden"}`}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 relative">
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute top-3 left-3 text-gray-400 hover:text-gray-600"
        >
          <i className="fas fa-times"></i>
        </button>

        <h3 className="text-xl font-bold text-red-600 mb-3">
          حدث خطأ غير متوقع
        </h3>

        <p className="text-gray-700 mb-2" id="errorMessage">
          {error?.message || String(error)}
        </p>

        {/* تفاصيل الخطأ (Stack Trace) */}
        <pre
          id="errorStack"
          className="bg-gray-50 text-gray-600 text-xs p-3 rounded overflow-auto max-h-48"
        >
          {error?.stack || ""}
        </pre>

        <div className="mt-4 flex justify-between">
          <button onClick={onCopy} className="btn btn-blue">
            نسخ التفاصيل
          </button>

          <button onClick={onReset} className="btn btn-orange">
            إعادة ضبط التطبيق
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorOverlay;
