interface Metric {
  label: string;
  value: string;
  icon: string;
  color: string;
}

interface ProcessingMetricsProps {
  metrics: Metric[];
}

const ProcessingMetrics = ({ metrics }: ProcessingMetricsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <div 
          key={index}
          className="bg-card rounded-lg p-4 elevation-subtle spring-animation hover:scale-105"
        >
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ 
                backgroundColor: `${metric.color}20`,
                boxShadow: `0 0 15px ${metric.color}30`
              }}
            >
              <svg className="w-5 h-5" fill={metric.color} viewBox="0 0 24 24">
                <path d={metric.icon} />
              </svg>
            </div>
            
            <div className="flex-1">
              <p className="text-xs text-muted-foreground font-inter">{metric.label}</p>
              <p 
                className="text-lg font-orbitron font-bold mt-1"
                style={{ color: metric.color }}
              >
                {metric.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProcessingMetrics;