'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChartDataPoint {
  name: string;
  uploads: number;
  processed: number;
  exported: number;
}

interface PerformanceChartProps {
  data: ChartDataPoint[];
}

const PerformanceChart = ({ data }: PerformanceChartProps) => {
  return (
    <div className="bg-card rounded-lg p-6 elevation-subtle">
      <h2 className="text-xl font-bold font-orbitron text-foreground mb-6">Processing Performance</h2>
      <div className="w-full h-80" aria-label="Processing Performance Bar Chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
            <XAxis 
              dataKey="name" 
              stroke="#B0B0B0"
              style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
            />
            <YAxis 
              stroke="#B0B0B0"
              style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
            />
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
            <Bar dataKey="uploads" fill="#00FFFF" name="Uploads" />
            <Bar dataKey="processed" fill="#8A2BE2" name="Processed" />
            <Bar dataKey="exported" fill="#00FF88" name="Exported" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceChart;