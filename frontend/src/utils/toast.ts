import { toast, ToastOptions } from 'react-toastify';
import { AxiosError } from 'axios';

// Toast configuration
const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

// User-friendly error messages mapping
const errorMessages: Record<string, string> = {
  // Auth errors
  'Invalid credentials': 'Email or password is incorrect. Please try again.',
  'No active account found with the given credentials': 'Email or password is incorrect. Please try again.',
  'user with this email already exists': 'This email is already registered. Try logging in instead.',
  'A user with that username already exists': 'This username is taken. Please choose another.',
  'This field may not be blank': 'Please fill in all required fields.',
  'password': 'Please enter a valid password (at least 8 characters).',
  'Passwords don\'t match': 'Your passwords don\'t match. Please try again.',
  
  // Network errors
  'Network Error': 'Unable to connect to the server. Please check your internet connection.',
  'timeout': 'The request timed out. Please try again.',
  
  // Server errors
  '500': 'Something went wrong on our end. Please try again later.',
  '502': 'Server is temporarily unavailable. Please try again later.',
  '503': 'Service is temporarily unavailable. Please try again later.',
  
  // Generic
  'default': 'Something went wrong. Please try again.',
};

// Extract user-friendly message from error
export const getUserFriendlyError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data;
    
    // Check for specific error messages in response
    if (data) {
      // Handle Django REST framework error format
      if (typeof data === 'object') {
        // Check for detail field
        if (data.detail) {
          const detail = String(data.detail);
          return errorMessages[detail] || detail;
        }
        
        // Check for field-specific errors
        for (const key of Object.keys(data)) {
          const fieldError = data[key];
          if (Array.isArray(fieldError) && fieldError.length > 0) {
            const errorMsg = String(fieldError[0]);
            return errorMessages[errorMsg] || `${key}: ${errorMsg}`;
          }
          if (typeof fieldError === 'string') {
            return errorMessages[fieldError] || fieldError;
          }
        }
      }
      
      if (typeof data === 'string') {
        return errorMessages[data] || data;
      }
    }
    
    // Handle HTTP status codes
    if (status) {
      if (status === 401) return 'Your session has expired. Please log in again.';
      if (status === 403) return 'You don\'t have permission to do this.';
      if (status === 404) return 'The requested resource was not found.';
      if (status >= 500) return errorMessages[String(status)] || errorMessages['500'];
    }
    
    // Network error
    if (error.message === 'Network Error') {
      return errorMessages['Network Error'];
    }
  }
  
  if (error instanceof Error) {
    return errorMessages[error.message] || error.message;
  }
  
  return errorMessages['default'];
};

// Log technical error for developers
export const logError = (context: string, error: unknown): void => {
  console.group(`🔴 Error: ${context}`);
  console.error('Error object:', error);
  
  if (error instanceof AxiosError) {
    console.error('Status:', error.response?.status);
    console.error('Response data:', error.response?.data);
    console.error('Request URL:', error.config?.url);
    console.error('Request method:', error.config?.method);
  }
  
  console.groupEnd();
};

// Toast functions
export const showSuccess = (message: string, options?: ToastOptions) => {
  toast.success(message, { ...defaultOptions, ...options });
};

export const showError = (message: string, options?: ToastOptions) => {
  toast.error(message, { ...defaultOptions, ...options });
};

export const showWarning = (message: string, options?: ToastOptions) => {
  toast.warning(message, { ...defaultOptions, ...options });
};

export const showInfo = (message: string, options?: ToastOptions) => {
  toast.info(message, { ...defaultOptions, ...options });
};

// Combined error handler - logs technical details and shows user-friendly message
export const handleError = (context: string, error: unknown): string => {
  logError(context, error);
  const userMessage = getUserFriendlyError(error);
  showError(userMessage);
  return userMessage;
};

export default {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  handleError,
  getUserFriendlyError,
  logError,
};
