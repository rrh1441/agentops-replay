'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function FileUpload() {
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  
  const handleFile = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });
      
      const { sessionId, events } = await res.json();
      
      // Store in sessionStorage for Vercel compatibility
      sessionStorage.setItem(`session-${sessionId}`, JSON.stringify(events));
      router.push(`/sessions/${sessionId}`);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploading(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      handleFile(file);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  return (
    <div 
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        type="file"
        accept=".csv"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="hidden"
        id="file-upload"
        disabled={uploading}
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="text-4xl mb-4">📁</div>
        <p className="text-lg font-medium">Drop CSV here or click to upload</p>
        <p className="text-sm text-gray-500 mt-2">Analyze any financial data</p>
      </label>
      {uploading && (
        <div className="mt-4">
          <div className="text-2xl animate-spin inline-block">⚙️</div>
          <p className="mt-2">Analyzing your data...</p>
        </div>
      )}
    </div>
  );
}