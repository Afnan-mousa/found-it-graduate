import React from "react";

const StatusBadge = ({ status }) => {
  // تحديد الألوان بناءً على الحالة
  const config = {
    found: { cls: "bg-green-100 text-green-700", text: "موجود" },
    returned: { cls: "bg-gray-100 text-gray-700", text: "تم التسليم" },
    lost: { cls: "bg-red-100 text-red-700", text: "مفقود" },
  };

  const { cls, text } = config[status] || config.lost;

  return (
    <span
      className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${cls}`}
    >
      {text}
    </span>
  );
};

export default StatusBadge;
