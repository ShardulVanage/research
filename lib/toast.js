import { toast as sonnerToast } from "sonner"

export function useToast() {
  return {
    toast: {
      success: (message) => sonnerToast.success(message),
      error: (message) => sonnerToast.error(message),
      loading: (message) => sonnerToast.loading(message),
      promise: (promise, messages) => sonnerToast.promise(promise, messages),
    },
  }
}

export const toast = {
  success: (message) => sonnerToast.success(message),
  error: (message) => sonnerToast.error(message),
  loading: (message) => sonnerToast.loading(message),
  promise: (promise, messages) => sonnerToast.promise(promise, messages),
}
