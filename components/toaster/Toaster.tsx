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
interface ToastOptions {
  id: string;
  message: string;
  duration?: number;
  icon?: JSX.Element; // Optional SVG icon
  animationVariant?: 'fade' | 'slide' | 'pop';
  type?: string; // Add type property to ToastOptions
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

const ToasterItem: FC<{
  toast: ToastOptions;
  onClose: (id: string) => void;
}> = memo(({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), toast.duration || 5000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  return (
    <div
      className={`toaster-item ${toast.animationVariant || 'fade'} relative p-3 bg-white rounded shadow-md`}
    >
      {toast.icon && <span className="mr-2">{toast.icon}</span>}
      <span>{toast.message}</span>
      <button onClick={() => onClose(toast.id)} className="ml-4 px-2 py-1">
        ×
      </button>
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
    const id = Math.random().toString(36).substring(2, 9);
    dispatch({
      type: 'ADD_TOAST',
      payload: { id, message, ...options },
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

// Convenience object for easily adding each toast type
export const Toast = {
  success: (message: string, options?: Partial<ToastOptions>) => {
    const { addToast } = useToast();
    return addToast(message, { ...options, type: TOAST_TYPES.SUCCESS });
  },
  error: (message: string, options?: Partial<ToastOptions>) => {
    const { addToast } = useToast();
    return addToast(message, { ...options, type: TOAST_TYPES.ERROR });
  },
  warning: (message: string, options?: Partial<ToastOptions>) => {
    const { addToast } = useToast();
    return addToast(message, { ...options, type: TOAST_TYPES.WARNING });
  },
  info: (message: string, options?: Partial<ToastOptions>) => {
    const { addToast } = useToast();
    return addToast(message, { ...options, type: TOAST_TYPES.INFO });
  }
};