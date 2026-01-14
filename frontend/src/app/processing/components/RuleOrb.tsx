interface RuleOrbProps {
  rule: string;
  category: string;
  confidence: number;
  delay: number;
}

const RuleOrb = ({ rule, category, confidence, delay }: RuleOrbProps) => {
  const getCategoryColor = () => {
    const colors: Record<string, string> = {
      'Eligibility': '#00FFFF',
      'Compliance': '#8A2BE2',
      'Validation': '#FF1493',
      'Calculation': '#00FF88',
      'Workflow': '#FF6B00'
    };
    return colors[category] || '#00FFFF';
  };

  return (
    <div 
      className="relative p-4 bg-card rounded-lg elevation-subtle spring-animation hover:scale-105 cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start space-x-3">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center animate-pulse"
          style={{ 
            backgroundColor: `${getCategoryColor()}20`,
            boxShadow: `0 0 20px ${getCategoryColor()}40`
          }}
        >
          <div 
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: getCategoryColor() }}
          />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span 
              className="text-xs font-rajdhani font-bold px-2 py-1 rounded"
              style={{ 
                backgroundColor: `${getCategoryColor()}20`,
                color: getCategoryColor()
              }}
            >
              {category}
            </span>
            <span className="text-xs font-jetbrains text-muted-foreground">
              {confidence}% confidence
            </span>
          </div>
          
          <p className="text-sm text-foreground font-inter">{rule}</p>
          
          <div className="mt-2 w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-1000"
              style={{ 
                width: `${confidence}%`,
                backgroundColor: getCategoryColor()
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RuleOrb;