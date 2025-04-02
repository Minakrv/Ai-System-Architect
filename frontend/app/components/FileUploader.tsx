'use client';

import { useRef } from 'react';

interface Props {
  onParsed: (content: string) => void;
}

export default function FileUploader({ onParsed }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:8000/upload-file', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    onParsed(data.full_content);
  };

  return (
    <div className="mb-4">
      <label className="text-sm font-semibold text-gray-700 mb-2 block">📁 Upload .txt or .md</label>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md"
        onChange={handleFileChange}
        className="block w-full border rounded px-3 py-2 bg-white"
      />
    </div>
  );
}