'use client';

import Icon from '@/components/ui/AppIcon';

interface SystemOverviewProps {
    stats: {
        totalPolicies: number;
        totalTasks: number;
        completedTasks: number;
        escalatedTasks: number;
    };
}

const SystemOverview = ({ stats }: SystemOverviewProps) => {
    const statCards = [
        {
            label: 'Total Policies',
            value: stats.totalPolicies,
            icon: 'DocumentTextIcon',
            color: 'text-primary',
            bg: 'bg-primary/10',
            border: 'border-primary/20'
        },
        {
            label: 'Total Tasks',
            value: stats.totalTasks,
            icon: 'ListBulletIcon',
            color: 'text-secondary',
            bg: 'bg-secondary/10',
            border: 'border-secondary/20'
        },
        {
            label: 'Completed Tasks',
            value: stats.completedTasks,
            icon: 'CheckCircleIcon',
            color: 'text-success',
            bg: 'bg-success/10',
            border: 'border-success/20'
        },
        {
            label: 'Escalated Tasks',
            value: stats.escalatedTasks,
            icon: 'ExclamationTriangleIcon',
            color: 'text-error',
            bg: 'bg-error/10',
            border: 'border-error/20'
        }
    ];

    return (
        <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Icon name="ChartBarIcon" size={24} />
                </div>
                <h2 className="text-xl font-bold font-orbitron text-foreground">📊 System Overview</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className={`p-6 bg-card rounded-xl border ${stat.border} elevation-subtle hover:scale-[1.02] transition-all duration-300`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 ${stat.bg} ${stat.color} rounded-lg`}>
                                <Icon name={stat.icon as any} size={24} />
                            </div>
                            <span className="text-xs font-orbitron text-muted-foreground uppercase tracking-widest">Live</span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold font-orbitron text-foreground mb-1">{stat.value}</h3>
                            <p className="text-sm font-rajdhani font-medium text-muted-foreground">{stat.label}</p>
                        </div>
                        <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${stat.color.replace('text-', 'bg-')} transition-all duration-1000`}
                                style={{ width: `${Math.min((stat.value / (stats.totalTasks || 1)) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SystemOverview;
