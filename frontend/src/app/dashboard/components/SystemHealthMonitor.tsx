import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface HealthMetric {
    name: string;
    status: 'healthy' | 'warning' | 'critical';
    value: string;
    icon: string;
}

interface SystemHealthMonitorProps {
    metrics: HealthMetric[];
}

const SystemHealthMonitor = ({ metrics }: SystemHealthMonitorProps) => {
    return (
        <div className="bg-card border border-white/5 rounded-2xl p-6 elevation-subtle h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold font-orbitron text-foreground">System Health</h2>
                    <p className="text-sm text-muted-foreground">Real-time infrastructure monitoring</p>
                </div>
                <div className="bg-white/5 p-2 rounded-lg">
                    <Icon name="ServerIcon" size={20} className="text-primary" />
                </div>
            </div>

            <div className="space-y-4">
                {metrics.map((metric, index) => {
                    const isHealthy = metric.status === 'healthy';
                    const isWarning = metric.status === 'warning';

                    const colorClass = isHealthy ? 'text-emerald-400' : isWarning ? 'text-orange-400' : 'text-red-400';
                    const bgClass = isHealthy ? 'bg-emerald-500/10' : isWarning ? 'bg-orange-500/10' : 'bg-red-500/10';
                    const borderClass = isHealthy ? 'border-emerald-500/20' : isWarning ? 'border-orange-500/20' : 'border-red-500/20';

                    return (
                        <div key={index} className={`p-4 rounded-xl border ${borderClass} ${bgClass} flex items-center justify-between transition-all hover:bg-opacity-20`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg bg-black/20 ${colorClass}`}>
                                    <Icon name={metric.icon as any} size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground text-sm">{metric.name}</h3>
                                    <p className={`text-xs ${colorClass} font-mono uppercase tracking-wider`}>
                                        {metric.status}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`font-mono font-bold ${colorClass}`}>{metric.value}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SystemHealthMonitor;