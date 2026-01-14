'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

export interface Task {
    id: string;
    name: string;
    policyId: string;
    ruleId: string;
    status: 'CREATED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'PENDING' | 'ESCALATED';
    role: 'Clerk' | 'Officer' | 'Admin';
    deadline: string;
    escalatedTo?: string;
}

interface RoleBasedTasksProps {
    tasks: Task[];
    onUpdateStatus: (taskId: string, newStatus: Task['status'], newRole?: Task['role']) => void;
}

const statusColors = {
    CREATED: 'bg-primary/20 text-primary border-primary/30',
    ASSIGNED: 'bg-secondary/20 text-secondary border-secondary/30',
    IN_PROGRESS: 'bg-warning/20 text-warning border-warning/30',
    COMPLETED: 'bg-success/20 text-success border-success/30',
    PENDING: 'bg-accent/20 text-accent border-accent/30',
    ESCALATED: 'bg-error/20 text-error border-error/30',
};

const RoleBasedTasks = ({ tasks, onUpdateStatus }: RoleBasedTasksProps) => {
    const [selectedRole, setSelectedRole] = useState<'Clerk' | 'Officer' | 'Admin' | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTasks = tasks.filter(task => {
        const matchesRole = selectedRole === 'all' || task.role === selectedRole;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = task.name.toLowerCase().includes(searchLower) ||
            task.policyId.toLowerCase().includes(searchLower) ||
            task.role.toLowerCase().includes(searchLower) ||
            task.status.toLowerCase().includes(searchLower);
        return matchesRole && matchesSearch;
    });

    const renderActionButtons = (task: Task) => {
        switch (task.status) {
            case 'CREATED':
                return (
                    <button
                        onClick={() => onUpdateStatus(task.id, 'ASSIGNED')}
                        className="px-4 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-orbitron font-bold rounded-lg border border-primary/30 transition-all"
                    >
                        Assign
                    </button>
                );
            case 'ASSIGNED':
                return (
                    <button
                        onClick={() => onUpdateStatus(task.id, 'IN_PROGRESS')}
                        className="px-4 py-1.5 bg-secondary/10 hover:bg-secondary/20 text-secondary text-xs font-orbitron font-bold rounded-lg border border-secondary/30 transition-all"
                    >
                        Start Task
                    </button>
                );
            case 'IN_PROGRESS':
                return (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onUpdateStatus(task.id, 'COMPLETED')}
                            className="px-4 py-1.5 bg-success/10 hover:bg-success/20 text-success text-xs font-orbitron font-bold rounded-lg border border-success/30 transition-all"
                        >
                            Complete
                        </button>
                        <button
                            onClick={() => {
                                const nextRole = task.role === 'Clerk' ? 'Officer' : 'Admin';
                                onUpdateStatus(task.id, 'ESCALATED', nextRole as any);
                            }}
                            className="px-4 py-1.5 bg-error/10 hover:bg-error/20 text-error text-xs font-orbitron font-bold rounded-lg border border-error/30 transition-all"
                        >
                            Escalate
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-card rounded-lg p-6 elevation-subtle border border-white/5">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Icon name="UserIcon" size={24} />
                    </div>
                    <h2 className="text-xl font-bold font-orbitron text-foreground">Role-Based Task Dashboard</h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-64">
                        <Icon name="MagnifyingGlassIcon" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search tasks or policies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg text-foreground font-jetbrains text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as any)}
                        className="px-4 py-2 bg-muted rounded-lg text-foreground font-rajdhani font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary border-none"
                    >
                        <option value="all">All Roles</option>
                        <option value="Clerk">Clerk</option>
                        <option value="Officer">Officer</option>
                        <option value="Admin">Admin</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                        <div key={task.id} className="p-5 bg-muted/50 border border-white/5 rounded-xl hover:border-primary/30 transition-all duration-300 group">
                            {task.status === 'ESCALATED' && (
                                <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg flex items-center space-x-3 animate-pulse">
                                    <Icon name="ExclamationTriangleIcon" size={18} className="text-error" />
                                    <p className="text-xs font-jetbrains text-error">
                                        ⚠️ Escalated Task: This task was escalated to {task.escalatedTo || task.role}
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-rajdhani font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                                        {task.name}
                                    </h3>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <span className="text-xs font-jetbrains text-muted-foreground">{task.policyId}</span>
                                        <span className="text-muted-foreground/30">•</span>
                                        <span className="text-xs font-jetbrains text-muted-foreground">{task.ruleId}</span>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-orbitron font-bold border ${statusColors[task.status]}`}>
                                    {task.status}
                                </span>
                            </div>

                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                                <div className="flex flex-col space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Icon name="ClockIcon" size={14} className="text-muted-foreground" />
                                        <span className="text-xs font-jetbrains text-muted-foreground">Deadline: {task.deadline}</span>
                                    </div>
                                    <span className="text-[10px] font-orbitron text-primary/70 uppercase tracking-wider">{task.role}</span>
                                </div>
                                <div className="flex items-center">
                                    {renderActionButtons(task)}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center bg-muted/20 rounded-xl border border-dashed border-white/10">
                        <p className="text-muted-foreground font-inter">No tasks found for the selected criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoleBasedTasks;
