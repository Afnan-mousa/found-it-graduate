import axios from 'axios';

// رابط الباك إند
const API_URL = 'http://localhost:5000/api';  

const API = axios.create({ baseURL: API_URL });

// إضافة التوكن تلقائياً
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
  },
  (error) => Promise.reject(error));

// =========================
// خدمات المستخدمين
// =========================
export const loginUser = (userData) => API.post('/users/login', userData);
export const registerUser = (userData) => API.post('/users/register', userData);

// =========================
// خدمات الإعلانات
// =========================

// جلب جميع الإعلانات مع فلاتر اختيارية 
export const fetchItems = (params = {}) => API.get("/items", { params });

// جلب إعلان واحد
export const fetchItemById = (id) => API.get(`/items/${id}`);

// إنشاء إعلان جديد
export const createItem = (newItem) => API.post('/items', newItem);

// alias حتى يبقى التوافق موجودًا مع AddPostPage أو أي ملف قديم
export const createPost = (postData) => API.post("/items", postData);

// جلب منشورات المستخدم الحالي
export const fetchMyItems = () => API.get('/items/my-posts');

// اسم بديل أوضح لو أردت استخدامه لاحقًا
export const getUserPosts = () => API.get("/items/my-posts");

// تحديث إعلان
export const updateItem = (id, updatedItem) => API.put(`/items/${id}`, updatedItem);

// حذف إعلان
export const deleteItem = (id) => API.delete(`/items/${id}`);

// تحديث حالة الإعلان إلى "تم التسليم"
export const markItemAsReturned = (id) => API.patch(`/items/${id}/return`);

export const startConversation = (otherUserId) =>
  API.post("/chat/start", { otherUserId });

export const fetchConversations = () => API.get("/chat");

export const fetchMessages = (conversationId) =>
  API.get(`/chat/${conversationId}/messages`);

export const sendMessage = (conversationId, text) =>
  API.post(`/chat/${conversationId}/messages`, { text });

export const markConversationAsRead = (conversationId) =>
  API.put(`/chat/${conversationId}/read`);

export const fetchUnreadCount = () => API.get("/chat/unread-count");
export const fetchChatNotifications = () => API.get("/chat/notifications");

export const getMyNotifications = () =>
  API.get("/notifications");

export const getUnreadNotificationsCount = () =>
  API.get("/notifications/unread-count");

export const markNotificationAsRead = (id) =>
  API.patch(`/notifications/${id}/read`);

export default API;