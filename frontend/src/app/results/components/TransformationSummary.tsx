import Icon from '@/components/ui/AppIcon';

interface SummaryItem {
    label: string;
    value: string;
    icon: string;
}

interface TransformationSummaryProps {
    summary: SummaryItem[];
}

const TransformationSummary = ({ summary }: TransformationSummaryProps) => {
    return (
        <div className="bg-card border border-white/5 rounded-2xl p-8 elevation-subtle relative overflow-hidden">
            {/* Decorative bg */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="flex items-center gap-4 mb-2 relative z-10">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Icon name="DocumentTextIcon" size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold font-orbitron text-white">Transformation Summary</h3>
                    <p className="text-sm text-muted-foreground">Complete overview of policy processing results</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mt-8 relative z-10">
                {summary.map((item, index) => (
                    <div key={index} className="flex items-start gap-4 group">
                        <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-colors">
                            <Icon name={item.icon as any} size={16} />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-jetbrains uppercase tracking-wide mb-1 opacity-70">{item.label}</p>
                            <p className="font-bold text-white text-lg">{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TransformationSummary;