  import React from "react";

  const Footer = ({ onNavigate, onDownload }) => {
    const currentYear = new Date().getFullYear();

    return (
      <footer className="bg-gray-900 text-white pt-16 pb-8 font-['Cairo']">
        <div className="max-w-6xl mx-auto px-6">
          <div
            className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 text-right"
            dir="rtl"
          >
            {/* العمود الأول: الشعار والوصف */}
            <div className="space-y-6">
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate("home");
                }}
                className="text-2xl font-bold text-white flex items-center gap-2 hover:text-blue-400 transition-colors"
              >
                <i className="fas fa-search-location text-blue-500"></i>
                <span>Found It Gaza</span>
              </a>
              <p className="text-gray-400 leading-relaxed text-sm">
                منصة مجتمعية تهدف لمساعدة سكان قطاع غزة في العثور على مفقوداتهم
                وإعادة الأمانات لأصحابها، لتعزيز روح التعاون والتكافل.
              </p>
              
            </div>

            {/* العمود الثاني: روابط سريعة */}
            <div>
              <h4 className="text-lg font-bold mb-6 border-b-2 border-blue-500 pb-2 inline-block">
                روابط سريعة
              </h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li>
                  <button
                    onClick={() => onNavigate("home")}
                    className="hover:text-blue-500 transition-colors"
                  >
                    الرئيسية
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate("listings", "lost")}
                    className="hover:text-blue-500 transition-colors"
                  >
                    المفقودات
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate("listings", "found")}
                    className="hover:text-blue-500 transition-colors"
                  >
                    الموجودات
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate("chat")}
                    className="hover:text-blue-500 transition-colors"
                  >
                    الرسائل
                  </button>
                </li>
              </ul>
            </div>

            {/* العمود الثالث: المساعدة */}
            <div>
              <h4 className="text-lg font-bold mb-6 border-b-2 border-blue-500 pb-2 inline-block">
                المساعدة
              </h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-blue-500 transition-colors">
                    عن المنصة
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-500 transition-colors">
                    سياسة الخصوصية
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-500 transition-colors">
                    شروط الاستخدام
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-500 transition-colors">
                    الأسئلة الشائعة
                  </a>
                </li>
              </ul>
            </div>

            {/* العمود الرابع: تواصل معنا */}
            <div>
              <h4 className="text-lg font-bold mb-6 border-b-2 border-blue-500 pb-2 inline-block">
                تواصل معنا
              </h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li className="flex items-center gap-3">
                  <i className="fas fa-envelope text-blue-500 w-5"></i>
                  <span className="ltr">support@foundit-gaza.com</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-phone text-blue-500 w-5"></i>
                  <span className="ltr">+970 59 123 4567</span>
                </li>
                <li className="flex items-center gap-3">
                  <i className="fas fa-map-marker-alt text-blue-500 w-5"></i>
                  <span>غزة، فلسطين</span>
                </li>
              </ul>
            </div>
          </div>

          {/* سطر الحقوق السفلي */}
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-xs">
            <p>
              © {currentYear}{" "}
              <span className="text-gray-400 font-bold">Found It Gaza</span>. جميع
              الحقوق محفوظة.
            </p>
            <p className="mt-2 opacity-50">
              صنع بكل حب لمساعدة أهلنا في قطاع غزة
            </p>
          </div>
        </div>
      </footer>
    );
  };

  export default Footer;
