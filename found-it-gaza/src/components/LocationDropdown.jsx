import React, { useState, useEffect, useRef } from "react";

const LocationDropdown = ({ tab, loc, setLoc }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropRef = useRef(null);

  const locations = [
    {
      group: "محافظة غزة",
      items: [
        "غزة - الرمال",
        "غزة - تل الهوا",
        "غزة - النصر",
        "غزة - الشيخ رضوان",
        "غزة - الصبرة",
      ],
    },
    {
      group: "محافظة الوسطى",
      items: ["دير البلح", "النصيرات", "الزوايدة", "المغازي"],
    },
    {
      group: "محافظة خانيونس",
      items: ["خانيونس - المواصي", "خانيونس - القرارة"],
    },
  ];

  // إغلاق القائمة عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropRef} style={{ zIndex: 50 }}>
      {/* حقل العرض الرئيسي */}
      <div
        className="search-input transition-all duration-300 w-full cursor-pointer flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={loc ? "text-gray-800" : "text-gray-400"}>
          {loc || (tab === "found" ? "أين تم العثور عليها؟" : "أين فُقد؟")}
        </span>
        <i
          className={`fas fa-chevron-down text-gray-400 text-sm transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        ></i>
      </div>

      {/* القائمة المنسدلة */}
      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
          style={{ animation: "fadeInDown 0.25s ease-out", zIndex: 9999 }}
        >
          {/* خيار "جميع المناطق" */}
          <div
            className="px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer border-b"
            onClick={() => {
              setLoc("");
              setIsOpen(false);
            }}
          >
            جميع المناطق
          </div>

          <div className="max-h-64 overflow-y-auto">
            {locations.map((group) => (
              <div key={group.group}>
                <div className="px-4 py-2 text-xs font-bold text-gray-400 bg-gray-50 sticky top-0">
                  {group.group}
                </div>
                {group.items.map((item) => (
                  <div
                    key={item}
                    className={`px-6 py-3 text-sm cursor-pointer transition-colors duration-200 flex items-center gap-2 ${
                      loc === item
                        ? "bg-blue-50 text-blue-600 font-bold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setLoc(item);
                      setIsOpen(false);
                    }}
                  >
                    <i
                      className={`fas fa-map-marker-alt text-xs ${loc === item ? "text-blue-500" : "text-gray-300"}`}
                    ></i>
                    {item}
                    {loc === item && (
                      <i className="fas fa-check text-blue-500 mr-auto text-xs"></i>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationDropdown;
