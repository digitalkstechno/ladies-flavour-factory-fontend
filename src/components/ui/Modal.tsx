import React from 'react';
import { createPortal } from 'react-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MdClose } from 'react-icons/md';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 backdrop-blur-sm p-4 sm:p-0 transition-all">
      <div className="relative w-full max-w-lg max-h-full">
        <div className={cn("relative bg-white rounded-xl shadow-2xl transform transition-all", className)}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
            <h3 className="text-xl font-semibold text-gray-900">
              {title}
            </h3>
            <button
              onClick={onClose}
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
            >
              <MdClose className="w-5 h-5" />
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          {/* Body */}
          <div className="p-4 md:p-5 space-y-4">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
