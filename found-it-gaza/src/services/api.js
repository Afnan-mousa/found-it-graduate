import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL: API_URL,
});

API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("userToken");

    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
  },
  (error) => Promise.reject(error)
);

// =========================
// خدمات المستخدمين
// =========================
export const loginUser = (userData) => API.post("/users/login", userData);
export const registerUser = (userData) => API.post("/users/register", userData);
export const updateUserProfile = (profileData) =>
  API.put("/users/profile", profileData);

// =========================
// خدمات الإعلانات
// =========================
export const fetchItems = (params = {}) => API.get("/items", { params });
export const fetchItemById = (id) => API.get(`/items/${id}`);
export const createItem = (newItem) => API.post("/items", newItem);
export const createPost = (postData) => API.post("/items", postData);
export const fetchMyItems = () => API.get("/items/my-posts");
export const getUserPosts = () => API.get("/items/my-posts");
export const updateItem = (id, updatedItem) => API.put(`/items/${id}`, updatedItem);
export const deleteItem = (id) => API.delete(`/items/${id}`);
export const markItemAsReturned = (id) => API.patch(`/items/${id}/return`);

// =========================
// خدمات المحادثات
// =========================
export const startConversation = (otherUserId) =>
  API.post("/chat/start", { otherUserId });

export const fetchMyConversations = () => API.get("/chat");
export const fetchMessages = (conversationId) =>
  API.get(`/chat/${conversationId}/messages`);

export const sendMessage = (conversationId, text) =>
  API.post(`/chat/${conversationId}/messages`, { text });

export const markMessagesAsRead = (conversationId) =>
  API.put(`/chat/${conversationId}/read`);

export const fetchUnreadCount = () => API.get("/chat/unread-count");
export const fetchChatNotifications = () => API.get("/chat/notifications");

// =========================
// خدمات الإشعارات
// =========================
export const fetchNotifications = () => API.get("/notifications");
export const fetchUnreadNotificationsCount = () =>
  API.get("/notifications/unread-count");

export const markNotificationAsRead = (notificationId) =>
  API.patch(`/notifications/${notificationId}/read`);

export default API;