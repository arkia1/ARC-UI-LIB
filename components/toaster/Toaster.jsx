import React, { createContext, useContext, useReducer, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';

// Toast Context
const ToastContext = createContext();

// Toast Types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Toast Positions
export const TOAST_POSITIONS = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
  TOP_CENTER: 'top-center',
  BOTTOM_CENTER: 'bottom-center',
};

// Actions
const ADD_TOAST = 'ADD_TOAST';
const REMOVE_TOAST = 'REMOVE_TOAST';

// Reducer
const toastReducer = (state, action) => {
  switch (action.type) {
    case ADD_TOAST:
      return [...state, action.payload];
    case REMOVE_TOAST:
      return state.filter(toast => toast.id !== action.payload);
    default:
      return state;
  }
};

// Helper function to get color based on toast type
const getColorByType = (type) => {
  switch (type) {
    case TOAST_TYPES.SUCCESS:
      return '#4caf50';
    case TOAST_TYPES.ERROR:
      return '#f44336';
    case TOAST_TYPES.WARNING:
      return '#ff9800';
    case TOAST_TYPES.INFO:
    default:
      return '#2196f3';
  }
};

// Use Tailwind for container layout
function ToastContainer({ position, children }) {
  const baseClasses = "fixed z-[9999] flex flex-col gap-3 md:max-w-xs";
  // Tailwind-based position classes
  let positionClasses = "";
  switch (position) {
    case TOAST_POSITIONS.TOP_LEFT:
      positionClasses = "top-5 left-5";
      break;
    case TOAST_POSITIONS.BOTTOM_RIGHT:
      positionClasses = "bottom-5 right-5";
      break;
    case TOAST_POSITIONS.BOTTOM_LEFT:
      positionClasses = "bottom-5 left-5";
      break;
    case TOAST_POSITIONS.TOP_CENTER:
      positionClasses = "top-5 left-1/2 -translate-x-1/2";
      break;
    case TOAST_POSITIONS.BOTTOM_CENTER:
      positionClasses = "bottom-5 left-1/2 -translate-x-1/2";
      break;
    case TOAST_POSITIONS.TOP_RIGHT:
    default:
      positionClasses = "top-5 right-5";
      break;
  }

  return (
    <div className={`${baseClasses} ${positionClasses}`}>
      {children}
    </div>
  );
}

// Create minimal & modern variants with Tailwind
function Toast({ toast, onClose }) {
  const { id, message, type, duration, variant = "modern" } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [id, duration, onClose]);

  // Variant base classes
  const variantClasses = {
    modern: "bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-lg",
    minimal: "bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700"
  };

  // Color by type (Tailwind instead of styled-components)
  const colorByType = {
    success: "border-l-4 border-green-500",
    error: "border-l-4 border-red-500",
    warning: "border-l-4 border-yellow-500",
    info: "border-l-4 border-blue-500"
  };

  return (
    <div
      className={`relative overflow-hidden flex items-start p-3 rounded transition-all duration-300 ${variantClasses[variant]} ${colorByType[type]} animate-slideIn`}
    >
      {/* Optional icons or text */}
      <div className="flex-1 mx-2 text-sm">
        {message}
      </div>
      <button
        onClick={() => onClose(id)}
        className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 ml-2"
      >
        ×
      </button>
      <div
        className="absolute bottom-0 left-0 h-1 bg-gray-200 dark:bg-gray-600 w-full"
        style={{ animation: `toastProgress linear ${duration}ms forwards` }}
      >
        <div
          className="h-full bg-current"
          style={{ animation: `toastProgressFill linear ${duration}ms forwards` }}
        />
      </div>
    </div>
  );
}

// Convert to memo for performance
const MemoizedToast = memo(Toast);

// Toast Provider Component
export const ToastProvider = ({ 
  children, 
  position = TOAST_POSITIONS.TOP_RIGHT,
  maxToasts = 5,
  defaultDuration = 5000
}) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const addToast = (message, type = TOAST_TYPES.INFO, duration = defaultDuration) => {
    const id = Math.random().toString(36).substring(2, 9);

    dispatch({
      type: ADD_TOAST,
      payload: { id, message, type, duration },
    });

    return id;
  };

  const removeToast = (id) => {
    dispatch({
      type: REMOVE_TOAST,
      payload: id,
    });
  };

  // Limit the number of toasts
  const visibleToasts = toasts.slice(0, maxToasts);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {createPortal(
        <ToastContainer position={position}>
          {visibleToasts.map(toast => (
            <MemoizedToast key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </ToastContainer>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

// Custom Hook for using the toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Convenience methods
export const Toast = {
  success: (message, duration, variant) => {
    const { addToast } = useToast();
    return addToast(message, TOAST_TYPES.SUCCESS, duration, variant);
  },
  error: (message, duration, variant) => {
    const { addToast } = useToast();
    return addToast(message, TOAST_TYPES.ERROR, duration, variant);
  },
  warning: (message, duration, variant) => {
    const { addToast } = useToast();
    return addToast(message, TOAST_TYPES.WARNING, duration, variant);
  },
  info: (message, duration, variant) => {
    const { addToast } = useToast();
    return addToast(message, TOAST_TYPES.INFO, duration, variant);
  }
};

// Tailwind animations
// <style> or a CSS file at global:
// @keyframes toastProgress { 0% { width: 100%; } to { width: 0%; } }
// @keyframes toastProgressFill { 0% { width: 0%; } to { width: 100%; } }
// .animate-slideIn { @apply transform translate-x-full opacity-0; animation: slideIn 0.3s forwards; }
// @keyframes slideIn { to { transform: translateX(0); opacity: 1; } }