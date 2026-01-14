interface ProcessingStageProps {
  stage: string;
  status: 'pending' | 'active' | 'completed';
  icon: string;
  description: string;
}

const ProcessingStage = ({ stage, status, icon, description }: ProcessingStageProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'active':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusBg = () => {
    switch (status) {
      case 'completed':
        return 'bg-success/20 box-glow-cyan';
      case 'active':
        return 'bg-primary/20 box-glow-cyan animate-pulse';
      default:
        return 'bg-muted/20';
    }
  };

  return (
    <div className={`relative p-4 rounded-lg transition-all duration-300 ${getStatusBg()}`}>
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor()} ${status === 'active' ? 'animate-pulse' : ''}`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d={icon} />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className={`font-rajdhani font-bold text-sm ${getStatusColor()}`}>{stage}</h4>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        {status === 'completed' && (
          <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
            <svg className="w-4 h-4 text-success-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessingStage;