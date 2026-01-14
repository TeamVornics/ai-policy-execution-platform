'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

export interface Task {
    id: string;
    policyId: string;
    ruleId: string;
    assignedRole: string;
    status: 'CREATED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
}

interface TaskSummaryProps {
    tasks: Task[];
    onProceed: () => void;
}

const TaskSummary: React.FC<TaskSummaryProps> = ({ tasks, onProceed }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4">
            <div className="w-full max-w-4xl bg-card border-2 border-primary/30 rounded-2xl p-8 elevation-subtle box-glow-cyan animate-in fade-in zoom-in duration-300">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/20 rounded-full mb-4">
                        <Icon name="ClipboardDocumentCheckIcon" size={20} className="text-primary" />
                        <span className="text-xs font-jetbrains text-primary uppercase tracking-widest">Task Creation Summary</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-foreground mb-2">
                        Policy Processed Successfully
                    </h2>
                    <p className="text-muted-foreground font-inter">
                        The following tasks have been automatically generated and assigned based on the policy rules.
                    </p>
                </div>

                <div className="overflow-hidden rounded-xl border border-border bg-muted/30 mb-8">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/50 border-b border-border">
                                <th className="px-6 py-4 text-xs font-orbitron font-bold text-primary uppercase tracking-wider">Task ID</th>
                                <th className="px-6 py-4 text-xs font-orbitron font-bold text-primary uppercase tracking-wider">Policy ID</th>
                                <th className="px-6 py-4 text-xs font-orbitron font-bold text-primary uppercase tracking-wider">Rule ID</th>
                                <th className="px-6 py-4 text-xs font-orbitron font-bold text-primary uppercase tracking-wider">Assigned Role</th>
                                <th className="px-6 py-4 text-xs font-orbitron font-bold text-primary uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {tasks.map((task) => (
                                <tr key={task.id} className="hover:bg-primary/5 transition-colors duration-200">
                                    <td className="px-6 py-4 font-jetbrains text-sm text-foreground">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-success">✔</span>
                                            <span>{task.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-jetbrains text-sm text-muted-foreground">{task.policyId}</td>
                                    <td className="px-6 py-4 font-jetbrains text-sm text-muted-foreground">{task.ruleId}</td>
                                    <td className="px-6 py-4 font-inter text-sm font-semibold text-accent">{task.assignedRole}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-success/20 text-success text-[10px] font-orbitron font-bold rounded-full border border-success/30">
                                            {task.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={onProceed}
                        className="px-10 py-4 bg-primary text-primary-foreground rounded-xl font-orbitron font-bold text-lg hover:scale-105 transition-all duration-200 box-glow-cyan flex items-center space-x-3"
                    >
                        <span>Proceed to Results</span>
                        <Icon name="ArrowRightIcon" size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskSummary;
