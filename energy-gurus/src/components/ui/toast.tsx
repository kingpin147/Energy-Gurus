import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { X } from 'lucide-react';

interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export const Toast: React.FC<ToastProps> = ({ title, description, variant = 'default' }) => {
  const [open, setOpen] = React.useState(true);
  return (
    <ToastPrimitive.Root
      open={open}
      onOpenChange={setOpen}
      className={`flex items-center p-4 rounded-xl shadow-lg transition-all duration-200 ${variant === 'destructive' ? 'bg-red-500 text-white' : 'bg-foreground/90 text-background'} `}
    >
      <div className="flex-1 mr-4">
        <ToastPrimitive.Title className="font-bold">{title}</ToastPrimitive.Title>
        {description && <ToastPrimitive.Description>{description}</ToastPrimitive.Description>}
      </div>
      <ToastPrimitive.Action asChild altText="Close">
        <button className="focus:outline-none" onClick={() => setOpen(false)}>
          <X className="w-4 h-4" />
        </button>
      </ToastPrimitive.Action>
    </ToastPrimitive.Root>
  );
};

// Provider for the toast list – place near the root layout
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ToastPrimitive.Provider swipeDirection="right" duration={5000}>
    {children}
    <ToastPrimitive.Viewport className="fixed bottom-4 right-4 flex flex-col gap-2" />
  </ToastPrimitive.Provider>
);
