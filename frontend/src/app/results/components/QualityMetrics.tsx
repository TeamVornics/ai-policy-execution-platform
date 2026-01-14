import Icon from '@/components/ui/AppIcon';

interface Metric {
  label: string;
  sub?: string;
  score: number;
  icon: string;
  color: string;
}

interface QualityMetricsProps {
  metrics: Metric[];
}

const QualityMetrics = ({ metrics }: QualityMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric, index) => {
        // Dynamic colors based on prop
        const colorClass = metric.color === 'success' ? 'text-emerald-400 bg-emerald-500' :
          metric.color === 'warning' ? 'text-orange-400 bg-orange-500' :
            'text-cyan-400 bg-cyan-500';

        const textClass = metric.color === 'success' ? 'text-emerald-400' :
          metric.color === 'warning' ? 'text-orange-400' :
            'text-cyan-400';

        const bgClass = metric.color === 'success' ? 'bg-emerald-500' :
          metric.color === 'warning' ? 'bg-orange-500' :
            'bg-cyan-500';

        return (
          <div
            key={index}
            className="bg-card border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all hover:shadow-lg hover:shadow-black/50 group"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center ${textClass} group-hover:scale-110 transition-transform`}>
                  <Icon name={metric.icon as any} size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{metric.label}</h4>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{metric.sub}</p>
                </div>
              </div>
              <div className={`text-3xl font-bold font-orbitron ${textClass}`}>
                {metric.score}%
              </div>
            </div>

            <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
              <div
                className={`h-full rounded-full ${bgClass} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
                style={{ width: `${metric.score}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QualityMetrics;