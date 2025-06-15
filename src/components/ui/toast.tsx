'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { X } from 'lucide-react';

type ToastVariant = 'default' | 'success' | 'destructive';

interface ToastProps {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toast: (props: ToastProps) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
});

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([]);

  const addToast = (props: ToastProps) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...props, id }]);
    
    // Auto-dismiss after duration
    const duration = props.duration || 5000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              p-4 rounded-lg shadow-lg text-white 
              ${
                toast.variant === 'destructive'
                  ? 'bg-red-500'
                  : toast.variant === 'success'
                  ? 'bg-green-500'
                  : 'bg-blue-500'
              }
              animate-in fade-in slide-in-from-right-5
              relative
            `}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{toast.title}</h3>
                {toast.description && (
                  <p className="text-sm mt-1 opacity-90">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white ml-4"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const toast = (props: ToastProps) => {
  // This is a fallback for when the hook can't be used
  console.log('Toast:', props.title, props.description);
  
  // Try to find toast container in DOM and create a temporary element
  const existingContainer = document.querySelector('[data-toast-container]');
  if (existingContainer) {
    const toastElement = document.createElement('div');
    toastElement.className = `
      p-4 rounded-lg shadow-lg text-white 
      ${
        props.variant === 'destructive'
          ? 'bg-red-500'
          : props.variant === 'success'
          ? 'bg-green-500'
          : 'bg-blue-500'
      }
      animate-in fade-in slide-in-from-right-5
      relative
      mb-2
    `;
    
    toastElement.innerHTML = `
      <div class="flex justify-between items-start">
        <div>
          <h3 class="font-medium">${props.title}</h3>
          ${props.description ? `<p class="text-sm mt-1 opacity-90">${props.description}</p>` : ''}
        </div>
      </div>
    `;
    
    existingContainer.appendChild(toastElement);
    
    setTimeout(() => {
      toastElement.classList.add('fade-out');
      setTimeout(() => {
        existingContainer.removeChild(toastElement);
      }, 300);
    }, props.duration || 5000);
  }
};
