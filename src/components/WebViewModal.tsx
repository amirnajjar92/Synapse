'use client';

import { useEffect } from 'react';

interface WebViewModalProps {
  url: string;
  title?: string;
  onClose: () => void;
}

export default function WebViewModal({ url, title, onClose }: WebViewModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4">
      {/* Modal Container */}
      <div className="relative w-full h-full max-w-6xl max-h-[95vh] bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1 min-w-0 mr-4">
            <h3 className="text-sm font-semibold truncate text-gray-900 dark:text-white">
              {title || 'Event Details'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
              {url}
            </p>
          </div>
          
          {/* Open in New Tab Button */}
          <button
            onClick={() => window.open(url, '_blank')}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mr-2"
            title="Open in new tab"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-600 dark:text-gray-300">
              <path
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Close (ESC)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-600 dark:text-gray-300">
              <path
                d="M6 18L18 6M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* iFrame */}
        <div className="flex-1 relative bg-white dark:bg-gray-900">
          <iframe
            src={url}
            className="absolute inset-0 w-full h-full border-0"
            title={title || 'Event Details'}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            loading="lazy"
          />
        </div>

        {/* Loading Indicator (optional) */}
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 pointer-events-none opacity-0 transition-opacity duration-300">
          <div className="text-gray-500 dark:text-gray-400">
            <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
