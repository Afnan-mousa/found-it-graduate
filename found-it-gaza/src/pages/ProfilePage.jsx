import React, { useState, useEffect, useMemo } from "react";
import { getUserPosts, deleteItem, updateUserProfile } from "../services/api";

function ProfilePage({ onManage, onDetails, refreshKey }) {
  const [userPosts, setUserPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("profile")) || {};
    } catch {
      return {};
    }
  }, []);

  const [name, setName] = useState(user.fullName || "");
  const [location, setLocation] = useState(user.location || "غزة، فلسطين");
  const [avatar, setAvatar] = useState(user.avatar || "");
  const activePosts = userPosts.filter((post) => !post.isResolved);
  const resolvedPosts = userPosts.filter((post) => post.isResolved);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("يرجى اختيار صورة صحيحة");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setAvatar(reader.result);
    };

    reader.readAsDataURL(file);
  };


const handleSaveProfile = async () => {
  try {
    setIsSaving(true);

    const { data } = await updateUserProfile({
      fullName: name.trim(),
      avatar,
      location: location.trim(),
    });

    localStorage.setItem("profile", JSON.stringify(data.user));
    setAvatar(data.user.avatar || "");
    setName(data.user.fullName || "مستخدم");
    setLocation(data.user.location || "غزة، فلسطين");

    alert("تم تحديث البروفايل");
  } catch (err) {
    console.error("Profile save error:", err);
    alert(err?.response?.data?.message || "فشل تحديث الملف الشخصي");
  } finally {
    setIsSaving(false);
  }
};

  const loadMyPosts = async () => {
    try {
      setLoading(true);
      const { data } = await getUserPosts();
      setUserPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("خطأ في جلب منشورات المستخدم:", error);
      setUserPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyPosts(); // جلب البيانات عند تحميل الصفحة
  }, [refreshKey]);

  const handleDeletePost = async (postId) => {
    const confirmed = window.confirm("هل أنت متأكد من حذف هذا الإعلان؟");
    if (!confirmed) return;

    try {
      await deleteItem(postId);
      setUserPosts((prev) => prev.filter((post) => post._id !== postId));
      alert("تم حذف الإعلان بنجاح");
    } catch (error) {
      console.error("خطأ في حذف الإعلان:", error);
      alert(error?.response?.data?.message || "فشل حذف الإعلان");
    }
  };

  useEffect(() => {
  const savedUser = localStorage.getItem("userData");

  if (savedUser) {
    const parsedUser = JSON.parse(savedUser);
    setUserData(parsedUser);
    setFormData({
      fullName: parsedUser.fullName || "",
      email: parsedUser.email || "",
      avatar: parsedUser.avatar || "",
      location: parsedUser.location || "",
      phone: parsedUser.phone || "",
    });
  }
}, []);

  return (
    <section id="profile-page" className="page-section bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-b from-blue-600 to-blue-500 text-white py-12 text-center">
        <h1 className="text-3xl font-bold mb-2">ملفي الشخصي</h1>
        <p className="opacity-90">إدارة بياناتك ومنشوراتك</p>
      </div>
      <div className="max-w-7xl mx-auto px-4 -mt-10 pb-12">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative">
              <img
                src={avatar && avatar.trim() !== "" ? avatar : null}
                alt="avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
              />
              <label className="absolute -bottom-1 -left-1 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm shadow cursor-pointer">
                <i className="fas fa-camera"></i>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            <div className="text-center sm:text-right flex-1">
              <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
              <p className="text-gray-500 mt-1">
                {user.email || "لا يوجد بريد إلكتروني"}
              </p>
              <p className="text-gray-500">{location}</p>
              <div className="text-gray-500 text-sm mt-1 flex items-center gap-2 justify-center sm:justify-start">
                <i className="fas fa-map-marker-alt"></i>
                <span id="profileLocationLabel">{location}</span>
              </div>
            </div>
            <div className="mt-3 sm:mt-0 sm:mr-auto flex gap-2">
              <button
                onClick={() => setActiveTab("settings")}
                className="btn btn-blue"
              >
                <i className="fas fa-user-edit"></i> تعديل الملف
              </button>
            </div>
          </div>
          <div className="mt-8">
            <div className="flex gap-2 border-b">
              <button
                className={`px-4 py-2 font-bold text-sm ${activeTab === "posts" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setActiveTab("posts")}
              >
                منشوراتي
              </button>
              <button
                className={`px-4 py-2 font-bold text-sm ${activeTab === "notifications" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setActiveTab("notifications")}
              >
                الإشعارات
              </button>
              <button
                className={`px-4 py-2 font-bold text-sm ${activeTab === "settings" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setActiveTab("settings")}
              >
                الإعدادات
              </button>
            </div>
            <div className="mt-6">
              {activeTab === "posts" && (
                <>
                  {loading ? (
                    <div className="text-center py-10 text-gray-500">
                      جاري تحميل المنشورات...
                    </div>
                  ) : userPosts.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                      لا توجد منشورات لديك حالياً
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userPosts.map((post) => (
                        <div
                          key={post._id}
                          className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 group"
                        >
                          <div className="relative h-40 bg-gray-200">
                            <img
                              src={post.image}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              alt="post"
                            />
                            <span
                              className={`absolute top-3 right-3 text-white text-xs font-bold px-3 py-1 rounded-full
                                 ${post.isResolved
                                      ? "bg-gray-500"
                                      : post.type === "found"
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }`}
                            >
                              {post.isResolved
                                ? "تم التسليم"
                                : post.type === "found"
                                ? "موجود"
                                : "مفقود"}
                            </span>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center text-xs text-gray-500 mb-2 gap-3">
                              <span>
                                <i className="far fa-clock ml-1"></i>{" "}
                                {post.createdAt}
                              </span>
                              <span>
                                <i className="fas fa-map-marker-alt ml-1"></i>{" "}
                                {post.location}
                              </span>
                            </div>
                            <span
                              className={`text-xs px-3 py-1 rounded-full font-bold ${
                                post.isResolved
                                  ? "bg-gray-200 text-gray-700"
                                  : post.type === "found"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {post.isResolved
                                ? "تم التسليم"
                                : post.type === "found"
                                ? "موجود"
                                : "مفقود"}
                            </span>
                            <h3 className="font-bold text-gray-800 mb-2">
                              {post.title}
                            </h3>
                            <div className="flex gap-2">
                              <button
                                className="flex-1 py-2 border rounded-lg text-sm hover:bg-gray-50"
                                onClick={() => onManage?.(post)}
                              >
                                إدارة
                              </button>
                              <button
                                className="flex-1 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm hover:bg-blue-50"
                                onClick={() => onDetails?.(post)}
                              >
                                عرض التفاصيل
                              </button>
                              <button
                                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                                onClick={() => handleDeletePost(post._id)}
                              >
                                {" "}
                                حذف
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              {activeTab === "notifications" && (
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 rounded-lg flex gap-3">
                    <i className="fas fa-bullhorn text-orange-500 mt-1"></i>
                    <div>
                      <div className="font-bold text-gray-800">
                        تمت الموافقة على إعلانك
                      </div>
                      <div className="text-sm text-gray-500">
                        محفظة جلدية - غزة
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg flex gap-3">
                    <i className="fas fa-inbox text-blue-500 mt-1"></i>
                    <div>
                      <div className="font-bold text-gray-800">رسالة جديدة</div>
                      <div className="text-sm text-gray-500">
                        لديك رسالة من خالد يوسف
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg flex gap-3">
                    <i className="fas fa-hand-holding-heart text-green-500 mt-1"></i>
                    <div>
                      <div className="font-bold text-gray-800">
                        شكراً لمساهمتك
                      </div>
                      <div className="text-sm text-gray-500">
                        تم تسليم غرض لصاحبه
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "settings" && (
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      الصورة الشخصية
                    </label>
                    <div className="flex items-center gap-4">
                      {avatar && avatar.trim() !== "" ? (
                        <img
                          src={avatar}
                          className="w-16 h-16 rounded-full object-cover border"
                          alt="avatar"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full border bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                          U
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="border p-2 rounded-md text-sm"
                        onChange={handleImageChange}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      الاسم الكامل
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border rounded-lg p-3 focus:outline-none focus:border-blue-500"
                      placeholder="الاسم"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      className="w-full border rounded-lg p-3 focus:outline-none focus:border-blue-500"
                      placeholder="example@mail.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      رقم الجوال
                    </label>
                    <input
                      type="tel"
                      className="w-full border rounded-lg p-3 focus:outline-none focus:border-blue-500"
                      placeholder="059xxxxxxx"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      الموقع
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full border rounded-lg p-3 focus:outline-none focus:border-blue-500"
                      placeholder="غزة - الرمال"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      نبذة قصيرة
                    </label>
                    <textarea
                      className="w-full border rounded-lg p-3 focus:outline-none focus:border-blue-500"
                      rows="3"
                      placeholder="اكتب نبذة عنك..."
                    ></textarea>
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-3">
                    <button
                      className="py-2 px-4 border rounded-lg hover:bg-gray-50"
                      type="button"
                    >
                      إلغاء
                    </button>
                    <button
                      className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                    >
                     {isSaving ? "جاري الحفظ..." : "حفظ التعديلات"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;
