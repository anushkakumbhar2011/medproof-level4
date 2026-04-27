import React from 'react'

export default function UploadTeaser({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full block bg-white border-[1.5px] border-dashed border-gray-300 rounded-card p-12 text-center mb-8 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
    >
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6BAE3E" strokeWidth="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
        </svg>
      </div>
      <h3 className="text-xl font-medium mb-2">Drag & drop or click to upload</h3>
      <p className="text-gray-600 text-sm">
        Files are encrypted end-to-end before upload. Supports PDF, JPEG, PNG up to 25 MB.
      </p>
    </button>
  )
}
