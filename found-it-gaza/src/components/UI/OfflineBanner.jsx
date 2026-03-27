import React from "react";

const OfflineBanner = ({ online }) => {
  return (
    <div
      id="offline-banner"
      className={`fixed top-16 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow z-50 ${online ? "hidden" : ""}`}
    >
      أنت غير متصل بالإنترنت. بعض الميزات قد لا تعمل.
    </div>
  );
};

export default OfflineBanner;
