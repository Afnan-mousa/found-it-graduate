import React, { useState } from 'react';

const LoginModal = ({ open, onClose, onLogin, onRegister }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  // ✅ إضافة المتغيرات لربط المدخلات
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
  };


  // ✅ الدالة المسؤولة عن الاتصال بالباك إند
  const handleAuth = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
   
       try {
      if (isSignUp) {
        await onRegister?.({
          fullName,
          email,
          password,
          phone: "000",
        });

        alert("تم إنشاء الحساب بنجاح");
      } else {
        await onLogin?.({
          email,
          password,
        });
      }

      resetForm();
      onClose?.();
    } catch (err) {
      console.error("Auth error:", err);
      alert(err?.response?.data?.message || "حدث خطأ ما");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null; 
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
        
        {/* زر الإغلاق */}
        <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600">
          <i className="fas fa-times text-xl"></i>
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 font-cairo">
              {isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
            </h2>
            <p className="text-gray-500 mt-2 text-sm">مرحباً بك في Found It Gaza</p>
          </div>

          <div className="flex flex-col gap-3 mb-6">
          <button 
            type="button" 
            className="flex items-center justify-center gap-3 w-full py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-semibold text-gray-700"
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
            </svg>
            <span>المتابعة باستخدام جوجل</span>
          </button>

          <button 
            type="button" 
            className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-[#1877F2] text-white rounded-xl hover:bg-[#166fe5] transition-all font-semibold"
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>المتابعة باستخدام فيسبوك</span>
          </button>
        </div>

          <div className="relative my-6 text-center">
            <span className="absolute inset-x-0 top-1/2 h-px bg-gray-200"></span>
            <span className="relative bg-white px-4 text-sm text-gray-400">أو عبر البريد الإلكتروني</span>
          </div>

          {/* نموذج الإدخال */}
          <form className="space-y-4" onSubmit={handleAuth}>
            {isSignUp && (
              <input 
              type="text" 
              placeholder="الاسم الكامل" 
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              
            )}
            <input 
            type="email" 
            placeholder="البريد الإلكتروني" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-right" />
            <input 
            type="password" 
            placeholder="كلمة المرور" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-right" />
            
            <button 
            disabled={isSubmitting}
            className={`w-full py-3 ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600'} text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all mt-4`}>
              {isSubmitting ? 'جاري المعالجة...' : (isSignUp ? 'إنشاء الحساب' : 'دخول')}
            </button>
          </form>

          {/* التبديل بين الحالتين */}
          <div className="mt-8 text-center text-sm">
            <span className="text-gray-500">
              {isSignUp ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}
            </span>
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="mr-2 text-blue-600 font-bold hover:underline"
                >
              {isSignUp ? 'سجل دخولك' : 'أنشئ حساباً الآن'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;