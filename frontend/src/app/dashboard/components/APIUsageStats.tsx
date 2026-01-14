

interface APIEndpoint {
  name: string;
  calls: number;
  avgResponse: string;
  successRate: string;
  status: 'healthy' | 'warning' | 'critical';
}

interface APIUsageStatsProps {
  endpoints: APIEndpoint[];
}

const statusColors = {
  healthy: 'text-success',
  warning: 'text-warning',
  critical: 'text-error'
};

const APIUsageStats = ({ endpoints }: APIUsageStatsProps) => {
  return (
    <div className="bg-card rounded-lg p-6 elevation-subtle">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold font-orbitron text-foreground">API Usage Statistics</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-rajdhani font-bold text-muted-foreground">Endpoint</th>
              <th className="text-left py-3 px-4 font-rajdhani font-bold text-muted-foreground">Calls</th>
              <th className="text-left py-3 px-4 font-rajdhani font-bold text-muted-foreground">Avg Response</th>
              <th className="text-left py-3 px-4 font-rajdhani font-bold text-muted-foreground">Success Rate</th>
              <th className="text-left py-3 px-4 font-rajdhani font-bold text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((endpoint, index) => (
              <tr key={index} className="border-b border-border hover:bg-muted spring-animation">
                <td className="py-4 px-4 font-jetbrains text-foreground">{endpoint.name}</td>
                <td className="py-4 px-4 font-jetbrains text-foreground">{endpoint.calls.toLocaleString()}</td>
                <td className="py-4 px-4 font-jetbrains text-foreground">{endpoint.avgResponse}</td>
                <td className="py-4 px-4 font-jetbrains text-foreground">{endpoint.successRate}</td>
                <td className="py-4 px-4">
                  <span className={`flex items-center space-x-2 ${statusColors[endpoint.status]}`}>
                    <div className={`w-2 h-2 rounded-full ${endpoint.status === 'healthy' ? 'bg-success' : endpoint.status === 'warning' ? 'bg-warning' : 'bg-error'} animate-pulse`} />
                    <span className="font-rajdhani font-bold uppercase text-xs">{endpoint.status}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default APIUsageStats;