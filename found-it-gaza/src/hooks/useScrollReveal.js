import { useEffect } from 'react';

export function useScrollReveal() {
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
      reveals.forEach((el) => {
        const windowHeight = window.innerHeight;
        const elementTop = el.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < windowHeight - elementVisible) {
          el.classList.add('active');
        }
      });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // التشغيل المبدئي عند تحميل الصفحة

    // دالة التنظيف (Cleanup) لإزالة المستمع عند إغلاق المكون
    return () => window.removeEventListener('scroll', revealOnScroll);
  }, []);
}