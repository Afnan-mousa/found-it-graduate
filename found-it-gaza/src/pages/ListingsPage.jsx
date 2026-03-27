import React, { useState, useMemo, useEffect } from "react";
import { fetchItems } from "../services/api";
import Fuse from "fuse.js";
import { LOCATION_OPTIONS } from "../data/locations";

const SEARCH_ALIASES = {
  مفتاح: ["مفاتيح", "مفتاح", "مفاتيح السيارة", "مفتاح سيارة"],
  مفاتيح: ["مفاتيح", "مفتاح", "مفاتيح السيارة", "مفتاح سيارة"],
  محفظه: ["محفظة", "محفظه", "جزدان", "wallet"],
  محفظة: ["محفظة", "محفظه", "جزدان", "wallet"],
  هويه: ["هوية", "هويه", "بطاقة", "بطاقه", "اثبات شخصية"],
  هوية: ["هوية", "هويه", "بطاقة", "بطاقه", "اثبات شخصية"],
  جوال: ["جوال", "موبايل", "هاتف", "تلفون", "هاتف محمول"],
  موبايل: ["جوال", "موبايل", "هاتف", "تلفون", "هاتف محمول"],
};

const ALL_CATEGORIES = [
  { label: "وثائق", value: "documents" },
  { label: "إلكترونيات", value: "electronics" },
  { label: "مفاتيح", value: "keys" },
  { label: "محفظة", value: "wallet" },
  { label: "مركبات", value: "vehicles" },
  { label: "حيوانات أليفة", value: "pets" },
  { label: "أخرى", value: "others" },
];

const normalizeArabic = (text = "") => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي");
};

const getExpandedTerms = (term = "") => {
  const normalized = normalizeArabic(term);
  return SEARCH_ALIASES[normalized] || [normalized];
};

const ListingsPage = ({
  type = "lost",
  initialTerm = "",
  initialLocation = "",
  initialCategory = "",
  onDetails,
  onContact,
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState(initialLocation);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [termFilter, setTermFilter] = useState(initialTerm);

  useEffect(() => {
    setLocationFilter(initialLocation || "");
    setCategoryFilter(initialCategory || "");
    setTermFilter(initialTerm || "");
  }, [initialLocation, initialCategory, initialTerm, type]);

  useEffect(() => {
    const getItems = async () => {
      try {
        setLoading(true);
        const params = {};
        if (type && type !== "all") {
          params.type = type;
        }
        if (initialCategory) params.category = initialCategory;

        const { data } = await fetchItems(params);
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    getItems();
  }, [type, initialCategory]);

  const filteredItems = useMemo(() => {
    let results = items.map((item) => ({
      ...item,
      searchableText: normalizeArabic(`
        ${item.title || ""}
        ${item.description || ""}
        ${item.category || ""}
        ${item.location || ""}
        ${item.locationDetails || ""}
      `),
    }));

    if (termFilter) {
      const expandedTerms = getExpandedTerms(termFilter).join(" ");
      const fuse = new Fuse(results, {
        keys: ["searchableText"],
        threshold: 0.4,
        includeScore: true,
      });

      results = fuse.search(normalizeArabic(expandedTerms)).map((r) => r.item);
    }

    results = results.filter((item) => {
      const matchesLocation = locationFilter
        ? normalizeArabic(item.location || "").includes(
            normalizeArabic(locationFilter)
          )
        : true;

      const matchesCategory = categoryFilter
        ? item.category === categoryFilter
        : true;

      return matchesLocation && matchesCategory;
    });

    return results;
  }, [items, termFilter, locationFilter, categoryFilter]);

  const formatResultsCount = (count) => {
    if (count === 0) return "لا توجد نتائج حالياً";
    if (count === 1) return "نتيجة واحدة فقط";
    return `تم العثور على ${count} نتائج`;
  };
  
  return (
    <section id="listings-page" className="page-section">
      {/* رأس الصفحة - Header Section */}
      <div className="bg-blue-600 py-12 text-center text-white">
        <h1 className="text-3xl font-bold mb-2">
          {type === "all" ? "كل المنشورات" : type === "found" ? "الموجودات" : "المفقودات"}
        </h1>
        <p className="opacity-90">{type === "all"
            ? "تصفح جميع المنشورات المنشورة على المنصة"
            : type === "found"
            ? "تصفح الأشياء التي تم العثور عليها"
            : "تصفح الأشياء المفقودة المعلَن عنها"}</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        {/* الشريط الجانبي (الفلتر) - Sidebar Filter */}
        <aside className="w-full md:w-1/4">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 sticky top-24">
            <h3 className="font-bold text-lg mb-4 border-b pb-2">
              تصفية النتائج
            </h3>

            {/* فلتر المدينة */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المدينة
              </label>
              <select 
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="فلترة حسب الموقع"
                className="w-full p-2 border rounded-md text-sm">
                <option value="">جميع المناطق</option>
                {LOCATION_OPTIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* فلتر التصنيف */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التصنيف
              </label>
              <div className="space-y-2">
                
                  <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    // className="border rounded-lg px-4 py-3"
                    className="flex items-center gap-2 text-sm cursor-pointer group">
                    <option value=""> كل التصنيفات </option>
                    {ALL_CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))} 
                  </select>
                    <div className="flex items-center justify-center md:justify-end text-gray-600 font-semibold">
                      {loading ? "جاري التحميل..." : formatResultsCount(filteredItems.length)}
                    </div>
        
              </div>
            </div>
          </div>
        </aside>

        {/* شبكة النتائج - Results Grid */}
        <main className="w-full md:w-3/4">
          <div className="flex justify-between items-center mb-6">
            {/* <span className="text-gray-500 font-medium">
              {formatResultsCount(items.length)}
            </span> */}
          </div>

          {loading && (
            <div className="text-center py-20">جاري تحميل الاعلانات...</div>
          )}
          
          {!loading && filteredItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group"
                >
                {/* صورة الإعلان */}
                <div className="relative h-48 bg-gray-200"> 
                  <img
                    src={item.image || "https://via.placeholder.com/600x400?text=No+Image"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  <span
                    className={`absolute top-4 right-4 text-white text-xs font-bold px-3 py-1 rounded-full ${
                      item.type === "found" ? "bg-green-500" : "bg-red-500" }`}
                  >
                    {item.isResolved
                      ? "تم التسليم"
                      : item.type === "found"
                      ? "موجود"
                      : "مفقود"}
                  </span>
                </div>

                {/* محتوى الكرت */}
                <div className="p-5">
                  <div className="flex items-center text-sm text-gray-500 mb-3 gap-4">
                    <span>
                      <i className="fas fa-map-marker-alt ml-1 text-red-400"></i>{" "}
                      {item.location}
                      {item.locationDetails && (
                        <p className="text-gray-400 text-sm mb-2">
                          {item.locationDetails}
                        </p>
                      )}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 mb-4 line-clamp-1 group-hover:text-blue-600 transition-colors">
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

                  <p className="text-gray-500 text-sm mb-2">
                      <i className="fas fa-user ml-1"></i>
                      {item.userId?.fullName || "مستخدم"}
                    </p>

                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {item.description}
                    </p>

                  {/* أزرار الإجراءات */}
                  {!item.isResolved ? (
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <button
                        className="py-2 border rounded-lg text-sm hover:bg-gray-50 font-bold transition-colors"
                        onClick={() => onDetails?.(item)}
                      >
                        التفاصيل
                      </button>

                      <button
                        onClick={() => onContact?.(item.userId)}
                        className="py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-bold text-sm"
                      >
                        تواصل
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 text-center text-sm font-bold text-gray-500">
                      تم تسليم هذا الإعلان
                    </div>
                  )}
                </div>
              </div>
            ))}   
            </div>
            )}
          {!loading && filteredItems.length === 0 &&(
            <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <i className="fas fa-search text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">لا توجد إعلانات تطابق بحثك حالياً</p>
            </div>
          )}

        </main>
      </div>
    </section>
  );
}; 

export default ListingsPage;
