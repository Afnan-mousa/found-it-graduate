import React, { useState , useEffect} from "react";
import LocationDropdown from "./LocationDropdown";
import AnimatedCounter from "./AnimatedCounter";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { fetchItems } from "../services/api";
import { LOCATION_OPTIONS } from "../data/locations";

const HomePage = ({ onSearch, onDetails, onContact, isAuthenticated }) => {
  const [tab, setTab] = useState("lost");
  const [isSearching, setIsSearching] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");

  const HOME_CATEGORIES = [
    { label: "وثائق", value: "documents" },
    { label: "إلكترونيات", value: "electronics" },
    { label: "مفاتيح", value: "keys" },
    { label: "محفظة", value: "wallet" },
    { label: "مركبات", value: "vehicles" },
    { label: "أخرى", value: "others" },
  ];

  // ✅ جلب البيانات من السيرفر عند تحميل الصفحة
  useEffect(() => {
    const getItems = async () => {
      try {
        const { data } = await fetchItems();
        const activeItems = data.filter(item => !item.isResolved);
        setItems(activeItems.slice(0, 3));
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
      } finally {
        setLoading(false);
      }
    };
    getItems();
  }, []);
  
  useScrollReveal();
  const heroSelectClass =
  "w-full h-[54px] border border-gray-300 rounded-lg px-4 bg-white text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all";

  return (
    <section id="home-page" className="page-section">
      {/* 1. قسم الهيرو والبحث - Hero & Search Section */}
      <section className="hero" style={{ position: "relative", zIndex: 30 }}>
        <h1 className="hero-title animate-fadeInDown">
          ساهم في إعادة المفقودات لأصحابها
        </h1>
        <p className="hero-desc animate-fadeInUp delay-200">
          منصة "Found It Gaza" تساعدك في الإبلاغ عن المفقودات أو البحث عن أغراضك
          بسهولة وسرعة داخل قطاع غزة.
        </p>

        <div className="search-container animate-scaleIn delay-300">
          <div className="search-tabs">
            <button
              className={`tab-btn ${tab === "lost" ? "active" : ""} transition-all hover:scale-105`}
              onClick={() => setTab("lost")}
            >
              بحث في المفقودات
            </button>
            <button
              className={`tab-btn ${tab === "found" ? "active" : ""} transition-all hover:scale-105`}
              onClick={() => setTab("found")}
            >
              بحث في الموجودات
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <input
              type="text"
              className="search-input w-full transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={ "ابحث ضمن المفقودات (مثال: هاتف سامسونج)"}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={heroSelectClass}
              >
                <option value="">جميع المناطق</option>
                {LOCATION_OPTIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={heroSelectClass}
              >
                <option value="">كل التصنيفات</option>
                <option value="documents">وثائق وهويات</option>
                <option value="electronics">أجهزة إلكترونية</option>
                <option value="keys">مفاتيح</option>
                <option value="wallet">محفظة</option>
                <option value="vehicles">مركبات</option>
                <option value="pets">حيوانات</option>
                <option value="others">أخرى</option>
              </select>
            </div>    
            <button
              onClick={() => onSearch(tab, searchTerm, location, category)}
              className="btn btn-blue btn-ripple hover-grow w-full py-3 text-lg font-bold"
              disabled={isSearching}
            >
              {isSearching ? (
                <i className="fas fa-spinner animate-spin ml-2"></i>
              ) : (
                <i className="fas fa-search ml-2"></i>
              )}
              {isSearching ? "جاري البحث..." : "بحث"}
            </button>
          </div>
        </div>

        {/* 2. الإحصائيات - Statistics Counters */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl px-4 relative z-10">
          <StatCard
            color="text-blue-600"
            target={500}
            label="غرض مفقود"
            delay="delay-100"
          />
          <StatCard
            color="text-orange-500"
            target={300}
            label="تم العثور عليه"
            delay="delay-200"
          />
          <StatCard
            color="text-green-600"
            target={200}
            label="قصة نجاح"
            delay="delay-300"
          />
        </div>
      </section>

      {/* 3. كيف تعمل المنصة - How it Works */}
      <section className="py-16 bg-white reveal relative z-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-12">
            كيف تعمل المنصة؟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <StepCard
              icon="fa-search"
              title="1. ابحث في الموقع"
              description="تصفح المفقودات والموجودات للتأكد من أن غرضك لم يتم الإبلاغ عنه مسبقاً."
              color="blue"
            />
            <StepCard
              icon="fa-plus-circle"
              title="2. أضف إعلان"
              description="سجل دخولك وأضف تفاصيل الغرض المفقود أو الذي عثرت عليه مع صورة."
              color="orange"
              delay="0.5s"
            />
            <StepCard
              icon="fa-handshake"
              title="3. تواصل واستلم"
              description="تواصل مع صاحب الإعلان عبر الرسائل أو الهاتف لاستعادة غرضك بأمان."
              color="green"
              delay="1s"
            />
          </div>
        </div>
      </section>

      {/* 4. التصنيفات - Categories */}
      <section className="py-16 bg-gray-50 reveal relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
            تصفح حسب التصنيف
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {HOME_CATEGORIES.map((cat, idx) => (
              <CategoryCard
                key={cat.value}
                cat={cat.label}
                idx={idx}
                onClick={() => onSearch(tab, "", "", cat.value)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. سكشن أحدث المنشورات - Latest Posts Section */}
      <section className="py-16 bg-gray-50 reveal" style={{ position: 'relative', zIndex: 1 }}>
        <div className="max-w-6xl mx-auto px-6">
          
          {/* رأس السكشن - Section Header */}
          <div className="flex justify-between items-end mb-10">
            <div className="text-right">
              <h2 className="text-3xl font-bold text-gray-800 mb-2 font-cairo">أحدث المنشورات</h2>
              <p className="text-gray-500">تصفح آخر ما تم إضافته للموقع في قطاع غزة</p>
            </div>
            
            {/* يظهر زر "عرض الكل" فقط إذا كان المستخدم مسجل دخوله */}
            
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSearch("all", "", "", "");
                }}
                className="relative z-20 inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-all"
                >
                <span> عرض الكل </span>
                <i className="fas fa-arrow-left"></i>
              </button>
            
          </div>

          {/* شبكة المنشورات - Posts Grid */}
          {/* ✅ شبكة المنشورات - عرض حالة التحميل */}
          {loading ? (
            <div className="text-center text-gray-600">جاري تحميل البيانات...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((item, idx) => (
                  <div 
                    key={item._id}
                    className={`relative rounded-2xl overflow-hidden shadow-sm transition-all duration-500 border border-gray-100 group ${
                      item.isResolved
                        ? "bg-gray-100 opacity-60 cursor-not-allowed"
                        : "bg-white hover:shadow-xl hover:-translate-y-2"
                    }`}
                    style={{ animationDelay: `${idx * 0.15}s` }}
                  >
                 
                  {/* صورة المنشور والتاغ */}
                  <div className="relative h-52 bg-gray-200 overflow-hidden">
                    <img 
                      src={item.image} // تأكد أن الباك إند يرسل رابط الصورة
                      alt={item.title} 
                      className={`w-full h-full object-cover transition-transform duration-700 ${!item.isResolved && "group-hover:scale-110"}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <span
                      className={`absolute top-4 right-4 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg transition-transform duration-300 ${
                        item.isResolved
                          ? "bg-gray-500"
                          : item.type === "lost"
                          ? "bg-red-500"
                          : "bg-green-500"
                      }`}
                    >
                      {item.isResolved
                        ? "تم التسليم"
                        : item.type === "lost"
                        ? "مفقود"
                        : "موجود"}
                    </span>
                  </div>

                  {/* محتوى البطاقة */}
                  <div className="p-6">
                    <div className="flex items-center text-xs text-gray-500 mb-3 gap-4 font-medium">
                      <span className="flex items-center"><i className="far fa-clock ml-1.5 text-blue-400"></i> {new Date(item.createdAt).toLocaleDateString('ar-EG')}</span>
                      <span className="flex items-center"><i className="fas fa-map-marker-alt ml-1.5 text-red-400"></i> {item.location}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-300 line-clamp-1">
                      {item.title}
                    </h3>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold ${
                        item.isResolved
                          ? "bg-gray-200 text-gray-700"
                          : item.type === "found"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.isResolved
                        ? "تم التسليم"
                        : item.type === "found"
                        ? "موجود"
                        : "مفقود"}
                    </span>
                    <p className="text-gray-600 text-sm mb-5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                    
                    {/* فوتر البطاقة */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-blue-100">
                          {item.userId?.avatar ? (
                            <img
                              src={item.userId.avatar}
                              alt={item.userId?.fullName || "مستخدم"}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                              <i className="fas fa-user text-blue-400 text-sm"></i>
                            </div>
                          )}
                        </div>
                        {/* ✅ عرض اسم المستخدم الفعلي */}
                        <span className="text-sm font-bold text-gray-700">{item.userId?.fullName || 'مستخدم'}</span>
                      </div>
                      
                        {!item.isResolved && (
                          <button 
                            className="flex items-center gap-1.5 text-blue-600 text-sm font-extrabold hover:text-blue-800 transition-all group/btn"
                            onClick={() => onDetails(item)}
                          >
                            <span>التفاصيل</span>
                            <i className="fas fa-chevron-left text-[10px]"></i>
                          </button>
                        )}
                    </div>
                  </div>
                </div>  
              ))}
            </div>
          )}
        </div>
      </section>

      
      {/* 6. سكشن قصص النجاح - Success Stories */}
      <section className="py-20 bg-white reveal relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 font-cairo">قصص نجاح</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              أشخاص استعادوا مفقوداتهم بفضل تعاون مجتمعنا الأمين في قطاع غزة
            </p>
          </div>

          {/* Stories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "سارة أحمد",
                location: "غزة - الرمال",
                img: "https://i.pravatar.cc/150?img=3",
                text: "فقدت كلبي في منطقة الرمال وكنت يائسة. نشرت إعلاناً على المنصة وخلال أسبوعين تواصل معي شخص وجده. شكراً لكم!",
                stars: 5
              },
              {
                name: "محمد خالد",
                location: "خانيونس",
                img: "https://i.pravatar.cc/150?img=8",
                text: "أضعت محفظتي في السوق وفيها كل أوراقي المهمة. شخص أمين وجدها ونشرها هنا. تواصلت معه واستلمتها كاملة بكل ما فيها.",
                stars: 5
              },
              {
                name: "أحمد عبدالله",
                location: "رفح",
                img: "https://i.pravatar.cc/150?img=15",
                text: "كان موعد سفري بعد يومين وأضعت جواز سفري. نشرت هنا وانتشر الإعلان بسرعة. شخص وجده وتواصل معي فوراً! أنقذتم مستقبلي.",
                stars: 4.5
              }
            ].map((story, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col h-full"
              >
                {/* User Info */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <img src={story.img} alt={story.name} className="w-14 h-14 rounded-full object-cover border-2 border-blue-50 group-hover:border-blue-500 transition-colors" />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{story.name}</div>
                    <div className="text-xs text-gray-400 font-medium">{story.location}</div>
                  </div>
                  <div className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-1 rounded-md self-start">تم الاسترداد</div>
                </div>

                {/* Story Text */}
                <p className="text-gray-600 text-sm leading-relaxed mb-6 italic text-right flex-1">
                  "{story.text}"
                </p>

                {/* Rating Stars */}
                <div className="flex items-center gap-1 text-yellow-400 text-xs">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`fas ${i + 0.5 < story.stars ? 'fa-star' : 'fa-star-half-alt'}`}></i>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Link */}
          <div className="mt-12 text-center">
            <button className="inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-4 transition-all group">
              <span>شارك قصة نجاحك معنا</span>
              <i className="fas fa-arrow-left transition-transform"></i>
            </button>
          </div>
        </div>
      </section>      
    </section>
  );
};

// مكونات فرعية صغيرة لتبسيط الكود الرئيسي (Helper Components)
const StatCard = ({ color, target, label, delay }) => (
  <div
    className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center hover-lift animate-fadeInUp ${delay} cursor-pointer`}
  >
    <div className={`text-3xl font-bold ${color} mb-2 animate-float`}>
      +<AnimatedCounter target={target} />
    </div>
    <div className="text-gray-500">{label}</div>
  </div>
);

const StepCard = ({ icon, title, description, color, delay }) => (
  <div className="flex flex-col items-center group cursor-pointer">
    <div
      className={`w-20 h-20 bg-${color}-50 text-${color}-600 rounded-full flex items-center justify-center text-3xl mb-6 shadow-sm transition-all duration-500 group-hover:bg-${color}-600 group-hover:text-white animate-float`}
      style={{ animationDelay: delay }}
    >
      <i className={`fas ${icon}`}></i>
    </div>
    <h3 className="text-xl font-bold mb-3 transition-colors">{title}</h3>
    <p className="text-gray-600 max-w-xs">{description}</p>
  </div>
);

const CategoryCard = ({ cat, idx, onClick }) => {
  const icons = {
    وثائق: "fa-id-card",
    إلكترونيات: "fa-mobile-alt",
    مفاتيح: "fa-key",
    محفظة: "fa-wallet",
    مركبات: "fa-car",
    أخرى: "fa-ellipsis-h",
  };
  return (
    <div
      className="flex flex-col items-center p-4 rounded-xl bg-white hover:bg-blue-50 cursor-pointer transition-all border border-gray-100 group hover-lift"
      style={{ animationDelay: `${idx * 0.1}s` }}
      onClick={onClick}
    >
      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl mb-3 group-hover:scale-125 transition-all">
        <i className={`fas ${icons[cat]}`}></i>
      </div>
      <span className="font-semibold text-gray-700">{cat}</span>
    </div>
  );
};

export default HomePage;
