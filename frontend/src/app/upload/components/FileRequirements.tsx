import React from 'react';

const FileRequirements = () => {
  return (
    <div className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
      <div className="flex items-center">
        <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        PDF, DOCX, TXT
      </div>
      <div className="flex items-center">
        <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Max 10MB
      </div>
      <div className="flex items-center">
        <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        OCR Supported
      </div>
    </div>
  );
};

export default FileRequirements;