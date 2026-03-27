import React from "react";

const Toast = ({ message }) => {
  return (
    <div
      id="toast"
      className={`fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 ${!message ? "hidden" : ""}`}
    >
      {message}
    </div>
  );
};

export default Toast;
