import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";

const Modal = ({ isOpen, onClose, children, size = "medium", showCloseButton = false }) => {
  const [animation, setAnimation] = useState(isOpen ? "open" : "closed");
  const modalRef = useRef(null);

  // Set animation states based on isOpen prop
  useEffect(() => {
    if (isOpen) {
      setAnimation("opening");
      document.body.style.overflow = 'hidden';
      // The small delay is needed for the animation to work properly
      const timer = setTimeout(() => setAnimation("open"), 10);
      return () => clearTimeout(timer);
    } else {
      setAnimation("closing");
      const timer = setTimeout(() => {
        setAnimation("closed");
        document.body.style.overflow = '';
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Handle clicks outside the modal to close it
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Set width based on size prop
  const getModalWidth = () => {
    switch (size) {
      case "small":
        return "max-w-sm";
      case "large":
        return "max-w-2xl";
      case "xl":
        return "max-w-4xl";
      case "full":
        return "max-w-7xl";
      case "medium":
      default:
        return "max-w-md";
    }
  };

  if (animation === "closed") return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black transition-opacity duration-300 ${
        animation === "opening" || animation === "closing"
          ? "bg-opacity-0"
          : "bg-opacity-50"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-xl shadow-2xl w-full ${getModalWidth()} mx-auto transform transition-all duration-300 ${
          animation === "opening"
            ? "opacity-0 translate-y-4 scale-95"
            : animation === "closing"
              ? "opacity-0 translate-y-4 scale-95"
              : "opacity-100 translate-y-0 scale-100"
        }`}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;