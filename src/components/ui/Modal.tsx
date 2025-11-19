import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { cn } from '../../utils/cn'; // Assuming cn.ts is in ../../utils/cn.ts

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, size = 'md' }) => {
  if (!isOpen) return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    // If modal-root doesn't exist, create it and append to body
    const newModalRoot = document.createElement('div');
    newModalRoot.setAttribute('id', 'modal-root');
    document.body.appendChild(newModalRoot);
    return ReactDOM.createPortal(<ModalContentWrapper onClose={onClose} size={size}>{children}</ModalContentWrapper>, newModalRoot);
  }

  return ReactDOM.createPortal(<ModalContentWrapper onClose={onClose} size={size}>{children}</ModalContentWrapper>, modalRoot);
};

interface ModalContentWrapperProps {
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const ModalContentWrapper: React.FC<ModalContentWrapperProps> = ({ onClose, children, size = 'md' }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Close on ESC key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Close on click outside
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent ref={contentRef} className={sizeClasses[size]}>
        {children}
      </ModalContent>
    </ModalOverlay>
  );
};


interface ModalOverlayProps {
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  children: React.ReactNode;
}

const ModalOverlay: React.FC<ModalOverlayProps> = ({ onClick, children }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    onClick={onClick}
  >
    {children}
  </div>
);

const ModalContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative z-50 transform rounded-lg bg-[#1E1E1E] text-white border border-white/10 p-6 shadow-xl transition-all duration-300 ease-out",
      "scale-95 opacity-0 data-[state=open]:scale-100 data-[state=open]:opacity-100", // Animation classes
      "w-full max-h-[90vh] flex flex-col", // Flex layout for scroll
      className
    )}
    data-state="open" // This will trigger the animation
    onClick={(e) => e.stopPropagation()} // Prevent clicks inside content from closing modal
    {...props}
  >
    {children}
  </div>
));
ModalContent.displayName = "ModalContent";

const ModalHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn("mb-4 text-lg font-semibold", className)} {...props}>
    {children}
  </div>
);

const ModalBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn("mb-4", className)} {...props}>
    {children}
  </div>
);

const ModalFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn("flex justify-end gap-2", className)} {...props}>
    {children}
  </div>
);

export { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter };
