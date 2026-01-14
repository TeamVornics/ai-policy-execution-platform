interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface ProcessingLogProps {
  logs: LogEntry[];
  isVisible: boolean;
}

const ProcessingLog = ({ logs, isVisible }: ProcessingLogProps) => {
  if (!isVisible) return null;

  const getLogColor = (type: string) => {
    const colors: Record<string, string> = {
      info: '#00FFFF',
      success: '#00FF88',
      warning: '#FF6B00',
      error: '#FF4444'
    };
    return colors[type] || '#00FFFF';
  };

  return (
    <div className="bg-card rounded-lg p-4 elevation-subtle max-h-64 overflow-y-auto">
      <h3 className="text-sm font-rajdhani font-bold text-foreground mb-3 flex items-center space-x-2">
        <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <span>Processing Log</span>
      </h3>
      
      <div className="space-y-2">
        {logs.map((log, index) => (
          <div 
            key={index}
            className="flex items-start space-x-3 p-2 rounded hover:bg-muted/50 transition-colors"
          >
            <div 
              className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
              style={{ backgroundColor: getLogColor(log.type) }}
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs font-jetbrains text-muted-foreground">
                  {log.timestamp}
                </span>
                <span 
                  className="text-xs font-rajdhani font-bold px-2 py-0.5 rounded"
                  style={{ 
                    backgroundColor: `${getLogColor(log.type)}20`,
                    color: getLogColor(log.type)
                  }}
                >
                  {log.type.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-foreground font-inter break-words">{log.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessingLog;