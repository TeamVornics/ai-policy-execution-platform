import React from 'react';

interface SampleFile {
  id: string;
  name: string;
  description: string;
  size: string;
  type: string;
  icon: string;
  color: string;
}

interface SampleFilesProps {
  onSampleSelect: (file: SampleFile) => void;
  isProcessing: boolean;
}

const SAMPLE_FILES: SampleFile[] = [
  {
    id: '1',
    name: 'Healthcare_Policy_2024.pdf',
    description: 'Standard healthcare coverage policy with exclusions',
    size: '2.4 MB',
    type: 'PDF',
    icon: 'doc',
    color: 'blue'
  },
  {
    id: '2',
    name: 'Vehicle_Insurance_Terms.docx',
    description: 'Comprehensive auto insurance terms and conditions',
    size: '1.1 MB',
    type: 'DOCX',
    icon: 'doc',
    color: 'green'
  },
  {
    id: '3',
    name: 'Property_Lease_Agreement.txt',
    description: 'Standard residential lease agreement template',
    size: '45 KB',
    type: 'TXT',
    icon: 'doc',
    color: 'orange'
  }
];

const SampleFiles: React.FC<SampleFilesProps> = ({ onSampleSelect, isProcessing }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {SAMPLE_FILES.map((file) => (
        <div
          key={file.id}
          onClick={() => !isProcessing && onSampleSelect(file)}
          className={`p-4 border rounded-lg transition-all ${isProcessing
              ? 'opacity-50 cursor-not-allowed border-gray-200'
              : 'cursor-pointer hover:shadow-md border-gray-200 hover:border-primary/50 bg-card hover:bg-card/50'
            }`}
        >
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded bg-${file.color}-100 text-${file.color}-600`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground truncate">{file.name}</h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{file.description}</p>
              <div className="flex items-center mt-2 space-x-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{file.type}</span>
                <span className="text-xs text-muted-foreground">{file.size}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SampleFiles;