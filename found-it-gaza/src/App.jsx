import React, { useState, useEffect } from "react";
import * as api from "./services/api";
// استيراد المكونات (تأكد من مطابقة المسارات)
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./components/HomePage";
import ListingsPage from "./pages/ListingsPage";
import AddPostPage from "./pages/AddPostPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import LoginModal from "./components/Modals/LoginModal";
import AdDetailsModal from "./components/Modals/AdDetailsModal";
import ManageAdModal from "./components/Modals/ManageAdModal";
import Toast from "./components/UI/Toast";
import OfflineBanner from "./components/UI/OfflineBanner";
import ErrorOverlay from "./components/UI/ErrorOverlay";
import { useScrollReveal } from "./hooks/useScrollReveal";
import { io } from "socket.io-client";
import { useRef } from "react";


function App() {
  // --- الحالات (States) ---
  const [currentPage, setCurrentPage] = useState("home");
  const [listingsType, setListingsType] = useState("lost");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [online, setOnline] = useState(navigator.onLine);
  const [errorObj, setErrorObj] = useState(null);

  const [dropdowns, setDropdowns] = useState({
    showProfile: false,
    showNotif: false,
    listingsType: "lost",
  });

  const [adDetails, setAdDetails] = useState({ open: false, ad: null });
  const [manageAd, setManageAd] = useState({ open: false, ad: null });
  const [chatRecipient, setChatRecipient] = useState("");
  const [showFab, setShowFab] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    type: "lost",
    term: "",
    location: "",
    category: "",
  });
  const [profileRefreshKey, setProfileRefreshKey] = useState(0);

  const [unreadCount, setUnreadCount] = useState(0);
  const [chatNotifications, setChatNotifications] = useState([]);
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  // --- التأثيرات (Effects) ---

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

useEffect(() => {
  if (!isAuthenticated) return;

  const token = localStorage.getItem("userToken");
  if (!token) return;

  socketRef.current = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
  });

  socketRef.current.on("connect", () => {
    console.log("Socket connected");
  });

  socketRef.current.on("notification:new", (payload) => {
    setNotifications((prev) => [payload, ...prev]);
    setNotificationCount((prev) => prev + 1);
  });

  socketRef.current.on("new_message", (payload) => {
    setUnreadCount((prev) => prev + 1);

    setChatNotifications((prev) => {
      const filtered = prev.filter(
        (n) => n.conversationId !== payload.conversationId
      );

      return [
        {
          conversationId: payload.conversationId,
          senderName: payload.sender.fullName,
          senderAvatar: payload.sender.avatar,
          text: payload.text,
          createdAt: payload.createdAt,
        },
        ...filtered,
      ];
    });
  });

  return () => {
    socketRef.current?.disconnect();
  };
}, [isAuthenticated]);

  useScrollReveal();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const loadChatNotifications = async () => {
    try {
      if (!isAuthenticated) {
        setUnreadCount(0);
        setChatNotifications([]);
        return;
      }

      const [countRes, notifRes] = await Promise.all([
        api.fetchUnreadCount(),
        api.fetchChatNotifications(),
      ]);

      setUnreadCount(countRes.data?.count || 0);
      setChatNotifications(notifRes.data?.notifications || []);
    } catch (error) {
      console.error("خطأ في جلب الإشعارات:", error.response?.data || error);
    }
  };

  const handleOpenNotification = async (notif) => {
  try {
    // إذا مش مقروء → علّميه كمقروء
    if (!notif.isRead) {
      await api.markNotificationAsRead(notif._id);

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notif._id ? { ...n, isRead: true } : n
        )
      );

      setNotificationCount((prev) => Math.max(prev - 1, 0));
    }

    // إغلاق قائمة الإشعارات
    setDropdowns((prev) => ({
      ...prev,
      showNotif: false,
      showProfile: false,
    }));

    // فتح المنشور المرتبط
    if (notif.type === "item_match" && notif.matchedItemId) {
      const matchedAd =
        typeof notif.matchedItemId === "object"
          ? notif.matchedItemId
          : null;

      if (matchedAd) {
        setAdDetails({ open: true, ad: matchedAd });
      }
    }

  } catch (error) {
    console.error("handleOpenNotification error:", error);
  }
};

  useEffect(() => {
    loadChatNotifications();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      loadChatNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const openConversationById = (conversationId) => {
    setChatRecipient(conversationId);
    setDropdowns((prev) => ({
      ...prev,
      showNotif: false,
      showProfile: false,
    }));
    navigate("chat");
  };

  const navigate = (page, type = "lost") => {
    if (page === "listings") {
      setListingsType(type);

      setSearchFilters((prev) => ({
        ...prev,
        type,
        term: type === "all" ? "" : prev.term,
        location: type === "all" ? "" : prev.location,
        category: type === "all" ? "" : prev.category,
      }));

      setDropdowns((prev) => ({
        ...prev,
        listingsType: type,
        showProfile: false,
        showNotif: false,
      }));
    } else {
      setDropdowns((prev) => ({
        ...prev,
        showProfile: false,
        showNotif: false,
      }));
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDetails = (ad) => {
    setAdDetails({ open: true, ad });
  };

  const requireLoginThen = (action) => {
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }
    action();
  };

  const openChat = async (userOrId) => {
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }
    const otherUserId =
    typeof userOrId === "string"
      ? userOrId
      : userOrId?._id || userOrId?.id || "";

    const currentUser = JSON.parse(localStorage.getItem("profile"));
  if (!otherUserId) {
    console.error("otherUserId not found:", userOrId);
    showToast("تعذر معرفة صاحب الإعلان");
    return;
  }

  if (otherUserId === currentUser?.id) {
    showToast("لا يمكنك فتح محادثة مع نفسك");
    return;
  }

  try {
    const { data } = await api.startConversation(otherUserId);
    setChatRecipient(data.conversation._id);
    setAdDetails({ open: false, ad: null });
    navigate("chat");
  } catch (error) {
    console.error("openChat error:", error.response?.data || error);
    showToast("فشل فتح المحادثة");
  }
};

  const handleSearch = (tab, term, loc, category) => {
  const nextType = tab || "lost";

  setListingsType(nextType);

  setSearchFilters({
    type: nextType,
    term: term || "",
    location: loc || "",
    category: category || "",
  });

  setDropdowns((prev) => ({
    ...prev,
    listingsType: nextType,
    showProfile: false,
    showNotif: false,
  }));

  setCurrentPage("listings");
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (category) {
    showToast(`تمت التصفية حسب التصنيف: ${category}`);
  }
};

  const handleDownload = () => {
    const html = "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "index.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("تم تنزيل النسخة الاحتياطية");
  };

  
    const loadNotifications = async () => {
    try {
      const [{ data: notifRes }, { data: countRes }] = await Promise.all([
        api.getMyNotifications(),
        api.getUnreadNotificationsCount(),
      ]);
  
      setNotifications(notifRes.notifications || []);
      setNotificationCount(countRes.count || 0);
    } catch (error) {
      console.error("loadNotifications error:", error);
    }
  };

  const handleLogin = async (payloadOrResponse) => {
    try {
      let loginResponse = payloadOrResponse;

      if (!payloadOrResponse?.token) {
        const response = await api.loginUser(payloadOrResponse);
        loginResponse = response.data;
      }
      
      const { token, user } = loginResponse;

      localStorage.setItem("userToken", token);
      localStorage.setItem("profile", JSON.stringify(user));

      setIsAuthenticated(true);
      setLoginOpen(false);

      await loadNotifications();

      showToast(`أهلاً بك يا ${ user?.fullName || "مستخدم"}`);
    } catch (error) {
      console.error("خطأ في تسجيل الدخول:", error);
      setErrorObj(error);
      showToast(error?.response?.data?.message || "فشل تسجيل الدخول");
    }
  };

useEffect(() => {
  if (isAuthenticated) {
    loadNotifications();
  }
}, [isAuthenticated]);


  
const handleRegister = async (userData) => {
  try {
    const response = await api.registerUser(userData);

    const { token, user } = response.data;

    // تخزين التوكن وبيانات المستخدم
    localStorage.setItem("userToken", token);
    localStorage.setItem("profile", JSON.stringify(user));

    setIsAuthenticated(true);
    setLoginOpen(false);

    showToast(`مرحباً ${user.name}`);
  } catch (error) {
    console.error("خطأ في التسجيل:", error);
    showToast(error?.response?.data?.message || "فشل إنشاء الحساب");
  }
};

  const handleUpdateAd = async (updatedForm) => {
    try {
      await api.updateItem(updatedForm._id, updatedForm);
      showToast("تم تحديث الإعلان بنجاح");
      setManageAd({ open: false, ad: null });
    } catch (error) {
      showToast("حدث خطأ أثناء الحفظ");
    }
  };

  const handleDeleteAd = async (id) => {
    try {
      await api.deleteItem(id);
      showToast("تم حذف الإعلان بنجاح");
      setManageAd({ open: false, ad: null });
    } catch (error) {
      console.error("خطأ أثناء حذف الإعلان:", error);
      showToast("حدث خطأ أثناء الحذف");
    }
  };

  const handleMarkReturned = async (postId) => {
  try {
    const { data } = await api.markItemAsReturned(postId);

    setItems((prev) =>
      prev.map((item) =>
        item._id === postId
          ? { ...item, isResolved: true }
          : item
      )
    );

    setManageAd({ open: false, ad: null });
    showToast("تم تحديث حالة الإعلان إلى تم التسليم");
  } catch (error) {
    console.error("mark returned error:", error.response?.data || error);
    showToast("فشل تحديث حالة الإعلان");
  }
};

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("profile"); // مسح التوكن والبيانات
    setIsAuthenticated(false);
    navigate("home");
    showToast("تم تسجيل الخروج");
  };

  useEffect(() => {
    const onScroll = () => {
      setShowFab(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onDocClick = () => {
      setDropdowns((prev) => ({
        ...prev,
        showProfile: false,
        showNotif: false,
      }));
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    const profile = localStorage.getItem("profile");
    if (token && profile) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const updateConnection = () => setOnline(navigator.onLine);
    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);
    return () => {
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
    };
  }, []);

  useEffect(() => {
    const onErr = (e) => setErrorObj(e.error || e.message || "Unknown error");
    const onRej = (e) => setErrorObj(e.reason || "Promise rejection");
    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRej);
    return () => {
      window.removeEventListener("error", onErr);
      window.removeEventListener("unhandledrejection", onRej);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  ///////////////////////////

  // ✅ 1. التحقق من بقاء المستخدم مسجلاً دخوله عند تحديث الصفحة
  useEffect(() => {
    const user = localStorage.getItem("profile");
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);

  // إظهار/إخفاء زر العودة للأعلى (Back to Top)
  useEffect(() => {
    const btn = document.getElementById("fabTop");
    const onScroll = () => {
      if (!btn) return;
      window.scrollY > 500
        ? btn.classList.add("show")
        : btn.classList.remove("show");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [currentPage]);

  return (
    <div className="min-h-screen flex flex-col font-['Cairo']">
      {/* الرأس - Header */}
      <Header
        currentPage={currentPage}
        onNavigate={navigate}
        isAuthenticated={isAuthenticated}
        onLoginClick={() => setLoginOpen(true)}
        onAddPost={() => requireLoginThen(() => navigate("add-post"))}
        dropdowns={{ ...dropdowns, listingsType }}
        setDropdowns={setDropdowns}
        onLogout={handleLogout}
        unreadCount={unreadCount}
        chatNotifications={chatNotifications}
        notifications={notifications}
        notificationCount={notificationCount}
        onOpenNotification={handleOpenNotification}
        onOpenConversation={openConversationById}
      />

      {/* الأزرار العائمة - Floating Action Buttons */}
      {currentPage !== "chat" && (
      <div className="fixed bottom-[25px] left-[25px] w-fit flex flex-col gap-[15px] z-[9999] pointer-events-none">
        {/* زر السهم للأعلى */}
        <button
          onClick={scrollToTop}
          className={`
              pointer-events-auto w-[50px] h-[50px] rounded-full bg-white border border-[#eee] shadow-[0_4px_12px_rgba(0,0,0,0.15)]
              flex items-center justify-center text-[18px] color-[#333]
              transition-all duration-400 cubic-bezier(0.175, 0.885, 0.32, 1.275)
              hover:bg-[#f8f9fa] hover:-translate-y-[3px] hover:shadow-[0_6px_15px_rgba(0,0,0,0.2)]
              ${
                showFab
                  ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                  : "opacity-0 translate-y-[20px] scale-50 pointer-events-none"
              }
            `}
          title="للأعلى"
        >
          <i className="fas fa-arrow-up"></i>
        </button>

        {/* زر الدردشة */}
        <button
          onClick={() => requireLoginThen(() => navigate("chat"))}
          className="
              pointer-events-auto w-[50px] h-[50px] rounded-full bg-white border border-[#eee] shadow-[0_4px_12px_rgba(0,0,0,0.15)]
              flex items-center justify-center text-[18px] text-gray-800
              transition-all duration-400 hover:bg-[#f8f9fa] hover:-translate-y-[3px] 
              hover:shadow-[0_6px_15px_rgba(0,0,0,0.2)] active:scale-90
            "
          title="الرسائل"
        >
          <i className="far fa-comments"></i>
        </button>
      </div>
      )}

      {/* المحتوى الرئيسي - Main Content */}
      <main className="flex-grow">
        {currentPage === "home" && (
          <HomePage
            onSearch={handleSearch}
            onDetails={handleDetails}
            onContact={openChat}
            isAuthenticated={isAuthenticated}
          />
        )}
        {currentPage === "listings" && (
          <ListingsPage
            type={listingsType}
            initialTerm={searchFilters.term}
            initialLocation={searchFilters.location}
            initialCategory={searchFilters.category}
            onDetails={handleDetails}
            onContact={openChat}
          />
        )}
        {currentPage === "add-post" && (
          <AddPostPage
            isAuthenticated={isAuthenticated}
            onRequireLogin={() => setLoginOpen(true)}
            onPublished={() => {
              showToast("تم النشر بنجاح");
              navigate("profile");
            }}
          />
        )}
        {currentPage === "chat" && <ChatPage recipient={chatRecipient} />}
        {currentPage === "profile" && (
          <ProfilePage
            refreshKey = {profileRefreshKey}
            onManage={(ad) => setManageAd({ open: true, ad })}
            onDetails={handleDetails}
          />
        )}
      </main>

      {/* التذييل - Footer */}
      { currentPage !== "chat" && (
      <Footer onNavigate={navigate} onDownload={handleDownload} />
      )}

      {/* المكونات الإضافية (Modals & UI) */}
      <Toast message={toast} />
      <OfflineBanner online={online} />

      {errorObj && (
        <ErrorOverlay
          error={errorObj}
          onClose={() => setErrorObj(null)}
          onReset={() => {
            setErrorObj(null);
            navigate("home");
          }}
        />
      )}

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      {adDetails.open && (
        <AdDetailsModal
          open={adDetails.open}
          ad={adDetails.ad}
          onClose={() => setAdDetails({ open: false, ad: null })}
          onContact={openChat}
        />
      )}

      {manageAd.open && (
        <ManageAdModal
          open={manageAd.open}
          ad={manageAd.ad}
          onClose={() => setManageAd({ open: false, ad: null })}
          onSave={handleUpdateAd}
          onDelete={handleDeleteAd}
          onMarkReturned={handleMarkReturned}
        />
      )}
    </div>
  );
}
export default App;
