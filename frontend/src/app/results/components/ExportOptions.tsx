'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ExportFormat {
  id: string;
  name: string;
  icon: string;
  description: string;
  size: string;
  color: string;
}

interface ExportOptionsProps {
  onExport: (format: string) => void;
}

const ExportOptions = ({ onExport }: ExportOptionsProps) => {
  const [selectedFormat, setSelectedFormat] = useState<string>('pdf');
  const [isExporting, setIsExporting] = useState(false);

  // Added colors from screenshot/theme
  const formats: ExportFormat[] = [
    {
      id: 'pdf',
      name: 'PDF Document',
      icon: 'DocumentTextIcon',
      description: 'Professional formatted document',
      size: '2.4 MB',
      color: 'text-cyan-400 bg-cyan-500'
    },
    {
      id: 'docx',
      name: 'Word Document',
      icon: 'DocumentIcon',
      description: 'Editable Microsoft Word format',
      size: '1.8 MB',
      color: 'text-blue-400 bg-blue-500'
    },
    {
      id: 'json',
      name: 'JSON Data',
      icon: 'CodeBracketIcon',
      description: 'Structured data for integration',
      size: '0.5 MB',
      color: 'text-purple-400 bg-purple-500'
    },
    {
      id: 'html',
      name: 'HTML Report',
      icon: 'GlobeAltIcon',
      description: 'Web-ready interactive report',
      size: '1.2 MB',
      color: 'text-orange-400 bg-orange-500'
    },
  ];

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      onExport(selectedFormat);
      setIsExporting(false);
    }, 2000);
  };

  const selectedFormatDetails = formats.find(f => f.id === selectedFormat);

  return (
    <div className="space-y-8">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {formats.map((format) => {
          const isSelected = selectedFormat === format.id;
          return (
            <button
              key={format.id}
              onClick={() => setSelectedFormat(format.id)}
              className={`
                        relative p-6 rounded-2xl text-left transition-all duration-300 group
                        ${isSelected
                  ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                  : 'bg-card border-white/5 hover:border-white/10 hover:bg-white/5'}
                        border h-full flex flex-col justify-between
                    `}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 bg-cyan-400 text-black text-xs font-bold px-2 py-1 rounded-full">
                  SELECTED
                </div>
              )}

              <div>
                <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center transition-transform group-hover:scale-110 ${isSelected ? 'bg-cyan-500 text-black' : 'bg-white/5 text-muted-foreground'}`}>
                  <Icon name={format.icon as any} size={24} />
                </div>
                <h3 className={`font-bold font-orbitron text-lg mb-2 ${isSelected ? 'text-cyan-400' : 'text-foreground'}`}>
                  {format.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{format.description}</p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground opacity-70">
                <Icon name="ArrowDownTrayIcon" size={12} />
                <span>{format.size}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Share Section */}
      <div className="bg-card border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Icon name="ShareIcon" size={24} />
          </div>
          <div>
            <h4 className="font-bold text-white text-lg">Share Results</h4>
            <p className="text-sm text-muted-foreground">Generate shareable link or send via email</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium flex items-center gap-2 transition-colors">
            <Icon name="LinkIcon" size={18} />
            Copy Link
          </button>
          <button className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-2 transition-colors shadow-lg shadow-purple-600/20">
            <Icon name="EnvelopeIcon" size={18} />
            Email
          </button>
        </div>
      </div>

      {/* Big Download Button */}
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`
            w-full py-5 rounded-2xl font-bold font-orbitron text-white text-xl uppercase tracking-widest
            flex items-center justify-center gap-3 transition-all duration-300
            ${isExporting ? 'bg-zinc-800 cursor-wait' : 'bg-pink-600 hover:bg-pink-500 shadow-xl shadow-pink-600/20 hover:scale-[1.01]'}
        `}
      >
        {isExporting ? (
          <>
            <Icon name="ArrowPathIcon" size={24} className="animate-spin" />
            <span>Generating File...</span>
          </>
        ) : (
          <>
            <Icon name="ArrowDownTrayIcon" size={24} />
            <span>Download {selectedFormatDetails?.name}</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ExportOptions;