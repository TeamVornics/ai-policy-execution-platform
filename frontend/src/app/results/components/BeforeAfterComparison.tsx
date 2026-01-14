'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ComparisonData {
  before: {
    format: string;
    size: string;
    complexity: string;
    readability: string;
  };
  after: {
    format: string;
    size: string;
    complexity: string;
    readability: string;
  };
}

interface BeforeAfterComparisonProps {
  data: ComparisonData;
}

const BeforeAfterComparison = ({ data }: BeforeAfterComparisonProps) => {
  const [view, setView] = useState<'before' | 'after'>('after');

  const items = [
    { label: 'Format', icon: 'DocumentTextIcon', key: 'format' },
    { label: 'File Size', icon: 'ServerIcon', key: 'size' },
    { label: 'Complexity', icon: 'CpuChipIcon', key: 'complexity' },
    { label: 'Readability', icon: 'EyeIcon', key: 'readability' },
  ];

  return (
    <div className="space-y-8">
      {/* Toggle */}
      <div className="flex justify-center">
        <div className="flex items-center bg-black/40 rounded-lg p-1 border border-white/10">
          <button
            onClick={() => setView('before')}
            className={`
                    px-6 py-2 rounded-md font-medium text-sm transition-all duration-200
                    ${view === 'before' ? 'bg-white/10 text-white shadow-sm' : 'text-muted-foreground hover:text-white'}
                `}
          >
            <Icon name="DocumentIcon" size={16} className="inline mr-2" />
            Before
          </button>
          <div className="w-8 h-[1px] bg-white/10 mx-2"></div>
          <button
            onClick={() => setView('after')}
            className={`
                    px-6 py-2 rounded-md font-medium text-sm transition-all duration-200
                    ${view === 'after' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-muted-foreground hover:text-white'}
                `}
          >
            <Icon name="SparklesIcon" size={16} className="inline mr-2" />
            After
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, index) => {
          const value = data[view][item.key as keyof typeof data.before];
          // Determine styling based on view
          const isAfter = view === 'after';

          return (
            <div
              key={index}
              className={`
                        p-6 rounded-2xl border transition-all duration-500 group relative overflow-hidden
                        ${isAfter
                  ? 'bg-card border-emerald-500/20 hover:border-emerald-500/40'
                  : 'bg-card/50 border-white/5 opacity-80'}
                    `}
            >
              <div className="flex items-center gap-3 mb-4">
                <Icon name={item.icon as any} size={20} className={isAfter ? 'text-emerald-400' : 'text-muted-foreground'} />
                <span className="text-sm font-bold text-white">{item.label}</span>
              </div>

              <div className={`text-2xl font-bold font-orbitron mb-2 ${isAfter ? 'text-cyan-400 text-glow-cyan' : 'text-muted-foreground'}`}>
                {value}
              </div>

              {isAfter && (
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold uppercase tracking-wider animate-pulse">
                  <Icon name="ArrowTrendingUpIcon" size={14} />
                  Improved
                </div>
              )}

              {/* Background glow for After view */}
              {isAfter && <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full group-hover:bg-emerald-500/20 transition-all" />}
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default BeforeAfterComparison;