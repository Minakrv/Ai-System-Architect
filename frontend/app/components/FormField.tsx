'use client';

import React from 'react';

interface FormFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: 'text' | 'textarea';
  rows?: number;
  icon?: string;
}

export default function FormField({
  label,
  id,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  rows = 3,
  icon = '',
}: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {icon && <span className="mr-1">{icon}</span>}
        {label}
      </label>

      {type === 'textarea' ? (
        <textarea
          id={id}
          className="w-full p-4 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-black"
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
        />
      ) : (
        <input
          id={id}
          type="text"
          className="w-full p-4 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
          value={value}
          placeholder={placeholder}
          onChange={onChange}
        />
      )}
    </div>
  );
}