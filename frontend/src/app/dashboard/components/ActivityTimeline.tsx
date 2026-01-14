import Icon from '@/components/ui/AppIcon';

interface TimelineEvent {
  id: number;
  type: 'upload' | 'process' | 'review' | 'export';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  status: 'completed' | 'processing' | 'failed';
}

interface ActivityTimelineProps {
  events: TimelineEvent[];
}

const eventIcons = {
  upload: 'CloudArrowUpIcon',
  process: 'CpuChipIcon',
  review: 'DocumentMagnifyingGlassIcon',
  export: 'ArrowDownTrayIcon'
};

const eventColors = {
  upload: 'text-primary',
  process: 'text-secondary',
  review: 'text-warning',
  export: 'text-success'
};

const statusColors = {
  completed: 'text-success',
  processing: 'text-warning',
  failed: 'text-error'
};

const ActivityTimeline = ({ events }: ActivityTimelineProps) => {
  return (
    <div className="bg-card rounded-lg p-6 elevation-subtle">
      <h2 className="text-xl font-bold font-orbitron text-foreground mb-6">Recent Activity</h2>
      <div className="space-y-6">
        {events.map((event, index) => (
          <div key={event.id} className="relative pl-8">
            {index !== events.length - 1 && (
              <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-muted" />
            )}
            <div className={`absolute left-0 top-0 p-2 rounded-full bg-muted ${eventColors[event.type]}`}>
              <Icon name={eventIcons[event.type] as any} size={16} />
            </div>
            <div className="bg-muted rounded-lg p-4 hover:bg-muted/80 spring-animation">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-rajdhani font-semibold text-foreground">{event.title}</h3>
                <span className={`text-xs font-jetbrains ${statusColors[event.status]} uppercase`}>
                  {event.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground font-jetbrains">
                <span>{event.user}</span>
                <span>{event.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;