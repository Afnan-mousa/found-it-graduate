import React, { useState, useEffect, useRef } from "react";
import {
  fetchMyConversations,
  fetchMessages,
  sendMessage,
  markMessagesAsRead,
} from "../services/api";


const ChatPage = ({ recipient }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem("profile"));

  const otherUser = conversations
    .find((c) => c._id === activeConversation)
    ?.participants.find((p) => p._id !== currentUser?.id);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const { data } = await fetchMyConversations();
        setConversations(data.conversations || []);

        if (recipient) {
          setActiveConversation(recipient);
        } else if (data.conversations?.length > 0) {
          setActiveConversation(data.conversations[0]._id);
        }
      } catch (err) {
        console.error("خطأ في جلب المحادثات:", err);
      }
    };

    loadConversations();
  }, [recipient]);

  useEffect(() => {
    if (!activeConversation) return;

    const loadMessages = async () => {
      try {
        const { data } = await fetchMessages(activeConversation);
        setMessages(data.messages || []);

        await markMessagesAsRead(activeConversation);
      } catch (err) {
        console.error("خطأ في جلب الرسائل:", err);
      }
    };

    loadMessages();
  }, [activeConversation]);


  // التمرير لأسفل عند إضافة رسالة جديدة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    window.scrollTo(0, 0); // رفع السكرول لأعلى نقطة (X=0, Y=0)
  }, []); 
  
const handleSend = async (e) => {
  e.preventDefault();
  if (!input.trim() || !activeConversation) return;

  try {
    const { data } = await sendMessage(activeConversation, input.trim());

    setMessages((prev) => [...prev, data.message]);
    setInput("");

    setConversations((prev) =>
      prev.map((conv) =>
        conv._id === activeConversation
          ? {
              ...conv,
              lastMessage: data.message.text,
              lastMessageAt: data.message.createdAt,
            }
          : conv
      )
    );
  } catch (err) {
    console.error("خطأ في إرسال الرسالة:", err);
  }
};


  return (
    <section id="chat-page" className="page-section">
      <div className="chat-page-container">
        {/* منطقة المحادثة النشطة */}
        <div className={`wa-chat-area ${!showMobileChat ? "hide-mobile" : ""}`}>
          <div className="wa-chat-header flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden text-gray-600 text-xl"
                onClick={() => setShowMobileChat(false)}
              >
                <i className="fas fa-arrow-right"></i>
              </button>
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                  {otherUser?.avatar ? (
                    <img
                      src={otherUser.avatar}
                      alt={otherUser?.fullName || "مستخدم"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    otherUser?.fullName?.charAt(0) || "م"
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 text-sm m-0 leading-tight">
                  {otherUser?.fullName || "مستخدم"}
                </h3>
                <span className="text-xs text-gray-500">
                  {isTyping ? "يكتب الآن..." : "محادثة"}
                </span>
              </div>
            </div>
            <div className="flex gap-5 text-gray-500 text-lg">
              <button>
                <i className="fas fa-search"></i>
              </button>
              <button>
                <i className="fas fa-ellipsis-v"></i>
              </button>
            </div>
          </div>

          <div className="wa-messages">
            <div className="wa-date-separator">
              <span>اليوم</span>
            </div>
            {messages.map((m) => {
              const isMe =
                m.sender?._id === currentUser?.id || m.sender === currentUser?.id;

              return (
                <div
                  key={m._id}
                  className={`wa-msg ${isMe ? "wa-msg-sent" : "wa-msg-received"}`}
                >
                  <span>{m.text}</span>
                  <span className="wa-msg-time">
                    {m.createdAt
                      ? new Date(m.createdAt).toLocaleTimeString("ar-EG", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                    {isMe && (
                      <i className="fas fa-check-double ml-1 text-sky-400 text-[10px]"></i>
                    )}
                  </span>
                </div>
              );
            })}
            {isTyping && (
              <div className="wa-msg wa-msg-received py-3 px-4">
                <div className="flex gap-1 items-center">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="wa-input-area flex items-center gap-3">
            <button className="text-gray-500 text-2xl">
              <i className="far fa-smile"></i>
            </button>
            <button className="text-gray-500 text-xl rotate-45">
              <i className="fas fa-paperclip"></i>
            </button>
            <form onSubmit={handleSend} className="flex-1 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اكتب رسالة..."
                className="flex-1 py-2 px-4 rounded-lg border-none focus:outline-none text-sm bg-white"
                dir="rtl"
              />
            </form>
            {input.trim() ? (
              <button
                onClick={handleSend}
                className="text-emerald-600 text-xl transition-transform active:scale-90"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            ) : (
              <button className="text-gray-500 text-xl">
                <i className="fas fa-microphone"></i>
              </button>
            )}
          </div>
        </div>

        {/* الشريط الجانبي - قائمة المحادثات */}
        <div className={`wa-sidebar ${showMobileChat ? "hide-mobile" : ""}`}>
          <div className="wa-sidebar-header flex items-center p-4 bg-gray-50 border-b">
            <div className="flex items-center gap-3">
              <img
                src={currentUser?.avatar || "https://via.placeholder.com/40?text=U"}
                alt="me"
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="font-bold text-gray-800">المحادثات</span>
            </div>
          </div>

          <div className="wa-search-box p-2 bg-white">
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث عن محادثة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none"
                dir="rtl"
              />
              <i className="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            
    {conversations
      .filter((conv) => {
        const other = conv.participants.find(
          (p) => p._id !== currentUser?.id
        );
        return (other?.fullName || "").includes(searchTerm);
      })
      .map((conv) => {
        const other = conv.participants.find(
          (p) => p._id !== currentUser?.id
        );

        return (
          <div
            key={conv._id}
            onClick={() => {
              setActiveConversation(conv._id);
              setShowMobileChat(true);
            }}
            className={`wa-contact flex items-center p-3 gap-3 cursor-pointer hover:bg-gray-50 transition ${
              activeConversation === conv._id ? "bg-gray-100" : ""
            }`}
          >
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center font-bold text-lg text-blue-600">
                {other?.avatar ? (
                  <img
                    src={other.avatar}
                    alt={other?.fullName || "مستخدم"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  other?.fullName?.charAt(0) || "م"
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold text-gray-900 text-sm truncate m-0">
                  {other?.fullName || "مستخدم"}
                </h3>
                <span className="text-[10px] text-gray-400">
                  {conv.lastMessageAt
                    ? new Date(conv.lastMessageAt).toLocaleTimeString("ar-EG", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
              </div>

              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500 truncate m-0 flex items-center">
                  {conv.lastMessage || "ابدأ محادثة"}
                </p>
              </div>
            </div>
          </div>
        );
  })}





          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatPage;
