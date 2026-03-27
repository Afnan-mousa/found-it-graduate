import React, { useRef } from "react";

const Header = ({
  currentPage,
  onNavigate,
  isAuthenticated,
  onLoginClick,
  onAddPost,
  dropdowns,
  setDropdowns,
  onLogout,
  unreadCount,
  chatNotifications,
  notifications,          
  notificationCount,
  onOpenConversation,
  onOpenNotification,
}) => {
  const navRef = useRef(null);

  const activeClass = (link) => {
    if (link === "home" && currentPage === "home") return "active";
    if (
      link === "lost" &&
      currentPage === "listings" &&
      dropdowns.listingsType === "lost"
    )
      return "active";
    if (
      link === "found" &&
      currentPage === "listings" &&
      dropdowns.listingsType === "found"
    )
      return "active";
    return "";
  };

  const toggleMobileMenu = () => {
    if (navRef.current) {
      navRef.current.classList.toggle("active");
    }
  };

  return (
    <header className="header">
      {/* الشعار - Logo */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onNavigate("home");
        }}
        className="logo"
      >
        <i className="fas fa-search-location"></i> Found It Gaza
      </a>

      {/* زر الجوال - Mobile Menu Button */}
      <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
        <i className="fas fa-bars"></i>
      </button>

      {/* روابط التنقل - Navigation Links */}
      <nav className="nav-links" ref={navRef}>
        <a
          href="#"
          className={`nav-link ${activeClass("home")}`}
          onClick={(e) => {
            e.preventDefault();
            onNavigate("home");
          }}
        >
          الرئيسية
        </a>
        <a
          href="#"
          className={`nav-link ${activeClass("lost")}`}
          onClick={(e) => {
            e.preventDefault();
            onNavigate("listings", "lost");
          }}
        >
          المفقودات
        </a>
        <a
          href="#"
          className={`nav-link ${activeClass("found")}`}
          onClick={(e) => {
            e.preventDefault();
            onNavigate("listings", "found");
          }}
        >
          الموجودات
        </a>
      </nav>

      {/* إجراءات المستخدم - User Actions */}
      <div className="user-actions">
        {!isAuthenticated && (
          <button className="btn btn-blue" onClick={onLoginClick}>
            دخول
          </button>
        )}

        {isAuthenticated && (
          <>
        <div className="relative flex-col">
          <button
            className="icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              setDropdowns((d) => ({
                ...d,
                showProfile: !d.showProfile,
                showNotif: false,
              }));
            }}
          >
            <i className="far fa-user"></i>
          </button>

          <div
            className={`dropdown flex flex-col min-w-[150px] ${
              dropdowns.showProfile 
              ? "show pointer-events-auto opacity-100" 
              : "pointer-events-none opacity-0 hidden"
            }`}
          >
            <div className=" px-3 py-2 text-sm text-gray-500 border-b border-gray-100 text-right">
              مرحباً بك
            </div>
            <button
              className="dropdown-item w-full text-right px-4 py-2 hover:bg-gray-50 flex items-center justify-start gap-2"
              onClick={() => {
                setDropdowns((d) => ({ ...d, showProfile: false }));
                onNavigate("profile");
              }}
            >
              <i className="far fa-id-card text-blue-500"></i> الملف الشخصي
            </button>
            <button
              className="dropdown-item w-full text-right px-4 py-2 hover:bg-gray-50 flex items-center justify-start gap-2"
              onClick={() => {
                setDropdowns((d) => ({ ...d, showProfile: false }));
                onNavigate("chat");
              }}
            >
              <i className="far fa-comments text-blue-500"></i> رسائلي
            </button>
            <button
              className="dropdown-item w-full text-right px-4 py-2 hover:bg-gray-50 flex items-center justify-start gap-2"
              onClick={() => {
                setDropdowns((d) => ({ ...d, showProfile: false }));
                onAddPost();
              }}
            >
              <i className="fas fa-plus text-orange-500"></i> إضافة إعلان
            </button>
            <div className="my-2 border-t"></div>
            <button
              className="dropdown-item text-red-600"
              onClick={onLogout}
            >
              <i className="fas fa-sign-out-alt"></i> تسجيل الخروج
            </button>
          </div>
        </div>
        <button 
          className="icon-btn" 
          onClick={() => {
            setDropdowns((d) => ({ ...d, showProfile: false, showNotif: false }));
            onNavigate("chat");
          }}
          title="الرسائل"
        >
          <i className="far fa-comments"></i>
          {notificationCount > 0 && (
        <span className="badge">{notificationCount}</span>
      )}
        </button>
        </>
        )}
        
        {/* التنبيهات - Notifications */}
        <div className="relative">
          <button
            className="icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              setDropdowns((d) => ({
                ...d,
                showNotif: !d.showNotif,
                showProfile: false,
              }));
            }}
          >
            <i className="far fa-bell"></i>
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>

          
            <div className={`dropdown ${dropdowns.showNotif ? "show" : ""}`}>
              <div className="px-3 py-2 font-bold text-gray-800 border-b">
                الإشعارات
              </div>

              {notifications.length === 0 ? (
                <div className="px-4 py-4 text-sm text-gray-500 text-center">
                  لا توجد إشعارات
                </div>
              ) : (
                notifications.map((notif) => (
                  <button
                    key={notif._id}
                    type="button"
                    onClick={() => onOpenNotification(notif)}
                    className="notif-item w-full text-right px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <div className="font-semibold text-sm text-gray-800">
                      {notif.title}
                    </div>

                    <div className="text-gray-600 text-xs mt-1">
                      {notif.body}
                    </div>
                  </button>
                ))
              )}
              {chatNotifications.length === 0 ? (
                <div className="px-4 py-4 text-sm text-gray-500 text-center">
                  لا توجد إشعارات جديدة
                </div>
              ) : (
                chatNotifications.map((notif) => (
                  <button
                    key={notif.conversationId}
                    type="button"
                    onClick={() => onOpenConversation(notif.conversationId)}
                    className="notif-item w-full text-right px-4 py-3 hover:bg-gray-50 flex items-start gap-3 border-b last:border-b-0"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center flex-shrink-0">
                      {notif.senderAvatar ? (
                        <img
                          src={notif.senderAvatar}
                          alt={notif.senderName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-blue-600 font-bold">
                          {notif.senderName?.charAt(0) || "م"}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-800">
                        رسالة جديدة
                      </div>
                      <div className="text-gray-600 text-xs truncate">
                        لديك رسالة من {notif.senderName}
                      </div>
                      <div className="text-gray-400 text-xs truncate mt-1">
                        {notif.text}
                      </div>
                    </div>
                  </button>
                ))
              )}

              <button
                onClick={() => {
                  setDropdowns((d) => ({ ...d, showNotif: false }));
                  onNavigate("chat");
                }}
                className="w-full text-blue-600 font-bold py-2 text-sm hover:bg-blue-50"
              >
                عرض الكل
              </button>
            </div>
        </div>

        {/* زر إضافة منشور - Add Post Button */}
        <button className="btn btn-orange" onClick={onAddPost}>
          <i className="fas fa-plus"></i>
          <span className="hide-mobile">أضف منشور</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
