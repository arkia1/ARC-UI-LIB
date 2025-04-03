import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  memo,
  FC,
  ReactNode,
  JSX,
  useMemo,
} from 'react';
import { createPortal } from 'react-dom';
import './toast-animations.css'; 

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

// Toast Options
export interface ToastOptions {
  id: string;
  message: string;
  duration?: number;
  icon?: JSX.Element;
  animationVariant?: 'fade' | 'slide' | 'pop' | 'modern';
  type?: string;
}

interface ToastContextProps {
  addToast: (message: string, options?: Partial<ToastOptions>) => string;
  removeToast: (id: string) => void;
}

// Use a safer context type
const ToastContext = createContext<ToastContextProps | undefined>(undefined);

// Toast Action Types
type ToastAction =
  | { type: 'ADD_TOAST'; payload: ToastOptions }
  | { type: 'REMOVE_TOAST'; payload: string };

// Reducer
const toastReducer = (state: ToastOptions[], action: ToastAction) => {
  switch (action.type) {
    case ADD_TOAST:
      return [...state, action.payload];
    case REMOVE_TOAST:
      return state.filter(toast => toast.id !== action.payload);
    default:
      return state;
  }
};

// Use Tailwind for container layout
const ToastContainer: FC<{ children: ReactNode; position: string }> = ({ children, position }) => {
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
};

const ToasterItem: FC<{ toast: ToastOptions; onClose: (id: string) => void }> = memo(({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), toast.duration || 5000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  // Map toast type to a thin left accent border
  const borderColor = toast.type === TOAST_TYPES.SUCCESS ? 'border-l-4 border-green-500'
                    : toast.type === TOAST_TYPES.ERROR ? 'border-l-4 border-red-500'
                    : toast.type === TOAST_TYPES.WARNING ? 'border-l-4 border-yellow-500'
                    : 'border-l-4 border-blue-500';

  // Modern design: white background in light, black background in dark mode
  const variantClasses: Record<string, string> = {
    modern: "bg-white text-black dark:bg-black dark:text-white",
    minimal: "bg-gray-100 text-black dark:bg-gray-900 dark:text-white border border-gray-300 dark:border-gray-700",
    fade: "bg-gray-50 text-black dark:bg-gray-800 dark:text-white",
    slide: "bg-gray-50 text-black dark:bg-gray-800 dark:text-white",
    pop: "bg-gray-50 text-black dark:bg-gray-800 dark:text-white",
  };

  // Use animation if provided; default to fadeIn if modern
  const animationClass = toast.animationVariant === 'fade'
    ? 'animate-fadeIn'
    : toast.animationVariant === 'slide'
    ? 'animate-slideIn'
    : toast.animationVariant === 'pop'
    ? 'animate-popIn'
    : 'animate-fadeIn';

  return (
    <div
      className={`toaster-item ${animationClass} relative p-3 rounded ${variantClasses[toast.animationVariant || "modern"]} ${borderColor}`}
    >
      {toast.icon && <span className="mr-2">{toast.icon}</span>}
      <span>{toast.message}</span>
      <button onClick={() => onClose(toast.id)} className="ml-4 px-2 py-1">×</button>
    </div>
  );
});

// Toast Provider Component
export const ToastProvider: FC<{
  children: ReactNode;
  position?: string;
  maxToasts?: number;
}> = ({ children, position = 'top-5 right-5', maxToasts = 5 }) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const addToast = (message: string, options?: Partial<ToastOptions>) => {
    const { duration = 5000, animationVariant = "modern" } = options || {};
    const id = Math.random().toString(36).substring(2, 9);
    dispatch({
      type: 'ADD_TOAST',
      payload: { id, message, duration, animationVariant, ...options },
    });
    return id;
  };

  const removeToast = (id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  };

  const value = useMemo(() => ({ addToast, removeToast }), []);
  const visibleToasts = toasts.slice(0, maxToasts);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <ToastContainer position={position}>
          {visibleToasts.map(t => (
            <ToasterItem key={t.id} toast={t} onClose={removeToast} />
          ))}
        </ToastContainer>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

// Custom Hook for using the toast
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export default ToastProvider;