'use client';

import Icon from '@/components/ui/AppIcon';

export interface AuditLog {
    id: string;
    taskId: string;
    action: string;
    role: string;
    time: string;
}

interface AuditLogViewProps {
    logs: AuditLog[];
}

const AuditLogView = ({ logs }: AuditLogViewProps) => {
    return (
        <div className="bg-card rounded-lg p-6 elevation-subtle border border-white/5 mt-6">
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-accent/10 rounded-lg text-accent">
                    <Icon name="ClipboardDocumentListIcon" size={24} />
                </div>
                <h2 className="text-xl font-bold font-orbitron text-foreground">📜 Audit Trail Table</h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="pb-4 font-orbitron text-xs text-muted-foreground uppercase tracking-wider">Task ID</th>
                            <th className="pb-4 font-orbitron text-xs text-muted-foreground uppercase tracking-wider">Action</th>
                            <th className="pb-4 font-orbitron text-xs text-muted-foreground uppercase tracking-wider">Role</th>
                            <th className="pb-4 font-orbitron text-xs text-muted-foreground uppercase tracking-wider">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                <td className="py-4 font-jetbrains text-sm text-primary/80 group-hover:text-primary transition-colors">{log.taskId}</td>
                                <td className="py-4 font-rajdhani font-semibold text-sm text-foreground">{log.action}</td>
                                <td className="py-4 font-orbitron text-[10px] text-muted-foreground uppercase tracking-widest">{log.role}</td>
                                <td className="py-4 font-jetbrains text-sm text-muted-foreground">{log.time}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLogView;
