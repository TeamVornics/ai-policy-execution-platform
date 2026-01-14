'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: 'cyan' | 'purple' | 'pink' | 'orange';
  action: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

const colorClasses = {
  cyan: 'bg-primary/10 text-primary hover:bg-primary/20 box-glow-cyan',
  purple: 'bg-secondary/10 text-secondary hover:bg-secondary/20 box-glow-purple',
  pink: 'bg-accent/10 text-accent hover:bg-accent/20 box-glow-pink',
  orange: 'bg-warning/10 text-warning hover:bg-warning/20'
};

const QuickActions = ({ actions }: QuickActionsProps) => {
  const router = useRouter();
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  return (
    <div className="bg-card rounded-lg p-6 elevation-subtle">
      <h2 className="text-xl font-bold font-orbitron text-foreground mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => router.push(action.action)}
            onMouseEnter={() => setHoveredAction(action.id)}
            onMouseLeave={() => setHoveredAction(null)}
            className={`p-6 rounded-lg spring-animation text-left ${colorClasses[action.color]} ${hoveredAction === action.id ? 'scale-105' : ''
              }`}
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-lg bg-background/50">
                <Icon name={action.icon as any} size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-rajdhani font-bold text-lg mb-1">{action.title}</h3>
                <p className="text-sm opacity-80 font-inter">{action.description}</p>
              </div>
              <Icon name="ChevronRightIcon" size={20} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;