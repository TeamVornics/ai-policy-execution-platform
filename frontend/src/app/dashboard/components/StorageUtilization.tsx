'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface StorageData {
  name: string;
  value: number;
  color: string;
}

interface StorageUtilizationProps {
  data: StorageData[];
  totalStorage: string;
  usedStorage: string;
}

const StorageUtilization = ({ data, totalStorage, usedStorage }: StorageUtilizationProps) => {
  return (
    <div className="bg-card rounded-lg p-6 elevation-subtle">
      <h2 className="text-xl font-bold font-orbitron text-foreground mb-6">Storage Utilization</h2>
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="w-full lg:w-1/2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1A1A',
                  border: '1px solid #2A2A2A',
                  borderRadius: '8px',
                  fontFamily: 'JetBrains Mono'
                }}
              />
              <Legend
                wrapperStyle={{
                  fontFamily: 'Rajdhani',
                  fontSize: '14px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full lg:w-1/2 space-y-4">
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground font-rajdhani mb-2">Total Storage</p>
            <p className="text-2xl font-bold font-orbitron text-foreground">{totalStorage}</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground font-rajdhani mb-2">Used Storage</p>
            <p className="text-2xl font-bold font-orbitron text-primary">{usedStorage}</p>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground font-rajdhani mb-2">Available</p>
            <p className="text-2xl font-bold font-orbitron text-success">
              {(parseFloat(totalStorage) - parseFloat(usedStorage)).toFixed(1)} GB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageUtilization;