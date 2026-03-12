import React from 'react';

export default function Modal({ title, children, onClose, size = 'md' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-xl border p-6 w-full max-w-${size === 'lg' ? '3xl' : size === 'md' ? 'xl' : 'sm'} relative`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-xl font-bold">×</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
