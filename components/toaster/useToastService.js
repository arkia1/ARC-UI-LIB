import { useToast } from "./Toaster";

export const ToastService = {
  success: (message, options) => {
    const { addToast } = useToast();
    return addToast(message, { ...options, type: "success" });
  },
  error: (message, options) => {
    const { addToast } = useToast();
    return addToast(message, { ...options, type: "error" });
  },
  warning: (message, options) => {
    const { addToast } = useToast();
    return addToast(message, { ...options, type: "warning" });
  },
  info: (message, options) => {
    const { addToast } = useToast();
    return addToast(message, { ...options, type: "info" });
  }
};
