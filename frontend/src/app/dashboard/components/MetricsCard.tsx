import Icon from '@/components/ui/AppIcon';

interface MetricsCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
  color: 'cyan' | 'purple' | 'pink' | 'orange' | 'green';
}

const colorClasses = {
  cyan: 'text-primary box-glow-cyan',
  purple: 'text-secondary box-glow-purple',
  pink: 'text-accent box-glow-pink',
  orange: 'text-warning',
  green: 'text-success'
};

const MetricsCard = ({ title, value, change, trend, icon, color }: MetricsCardProps) => {
  return (
    <div className="bg-card rounded-lg p-6 elevation-subtle hover:scale-105 spring-animation">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-muted ${colorClasses[color]}`}>
          <Icon name={icon as any} size={24} />
        </div>
        <div className={`flex items-center space-x-1 text-sm font-jetbrains ${trend === 'up' ? 'text-success' : 'text-error'}`}>
          <Icon name={trend === 'up' ? 'ArrowTrendingUpIcon' : 'ArrowTrendingDownIcon'} size={16} />
          <span>{change}</span>
        </div>
      </div>
      <h3 className="text-muted-foreground text-sm font-rajdhani mb-2">{title}</h3>
      <p className="text-3xl font-bold font-orbitron text-foreground">{value}</p>
    </div>
  );
};

export default MetricsCard;