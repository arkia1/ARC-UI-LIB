import { useToast } from "./Toaster";
import type { ToastOptions } from "./Toaster";

export const ToastService = {
  success: (message: string, options?: Partial<ToastOptions>) => {
    const { addToast } = useToast();
    return addToast(message, { ...options, type: "success" });
  },
  error: (message: string, options?: Partial<ToastOptions>) => {
    const { addToast } = useToast();
    return addToast(message, { ...options, type: "error" });
  },
  warning: (message: string, options?: Partial<ToastOptions>) => {
    const { addToast } = useToast();
    return addToast(message, { ...options, type: "warning" });
  },
  info: (message: string, options?: Partial<ToastOptions>) => {
    const { addToast } = useToast();
    return addToast(message, { ...options, type: "info" });
  }
};
