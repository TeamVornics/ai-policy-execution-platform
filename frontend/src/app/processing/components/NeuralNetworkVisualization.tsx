import React, { useMemo } from 'react';

interface NeuralNode {
  id: number;
  x: number;
  y: number;
  size: number;
  layerIndex: number;
}

interface NeuralConnection {
  from: number;
  to: number;
}

interface NeuralNetworkVisualizationProps {
  isProcessing: boolean;
}

const NeuralNetworkVisualization = ({ isProcessing }: NeuralNetworkVisualizationProps) => {
  const layers = [
    { nodes: 8, color: '#00FFFF' },
    { nodes: 12, color: '#8A2BE2' },
    { nodes: 16, color: '#FF1493' },
    { nodes: 10, color: '#00FF88' },
    { nodes: 6, color: '#FFD700' }
  ];

  const { nodes, connections } = useMemo(() => {
    const nodes: NeuralNode[] = [];
    const connections: NeuralConnection[] = [];
    let id = 0;

    // Generate nodes
    layers.forEach((layer, layerIndex) => {
      const layerX = (layerIndex / (layers.length - 1)) * 100;
      for (let i = 0; i < layer.nodes; i++) {
        const nodeY = ((i + 1) / (layer.nodes + 1)) * 100;
        nodes.push({
          id: id++,
          x: layerX,
          y: nodeY,
          size: 1.2 + Math.random() * 0.8,
          layerIndex
        });
      }
    });

    // Generate connections
    nodes.forEach((node) => {
      const nextLayerNodes = nodes.filter(n => n.layerIndex === node.layerIndex + 1);
      nextLayerNodes.forEach(nextNode => {
        if (Math.random() > 0.4) {
          connections.push({ from: node.id, to: nextNode.id });
        }
      });
    });

    return { nodes, connections };
  }, []);

  return (
    <div className="relative w-full h-full">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connections */}
        {connections.map((conn, i) => {
          const fromNode = nodes[conn.from];
          const toNode = nodes[conn.to];

          return (
            <line
              key={`conn-${i}`}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke="#2A2A2A"
              strokeWidth="0.1"
              opacity="0.2"
            />
          );
        })}

        {/* Active connection pulses */}
        {isProcessing && connections.map((conn, i) => {
          if (Math.random() > 0.05) return null; // Only show some active pulses
          const fromNode = nodes[conn.from];
          const toNode = nodes[conn.to];

          return (
            <line
              key={`pulse-${i}`}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke={layers[fromNode.layerIndex].color}
              strokeWidth="0.4"
              className="animate-pulse"
              style={{
                animationDuration: `${0.5 + Math.random()}s`,
                filter: 'url(#glow)'
              }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const color = layers[node.layerIndex].color;
          return (
            <circle
              key={`node-${node.id}`}
              cx={node.x}
              cy={node.y}
              r={node.size}
              fill={isProcessing && Math.random() > 0.7 ? color : '#1A1A1A'}
              stroke={color}
              strokeWidth="0.2"
              opacity={isProcessing && Math.random() > 0.7 ? 1 : 0.4}
              filter={isProcessing && Math.random() > 0.7 ? 'url(#glow)' : 'none'}
              className={isProcessing && Math.random() > 0.7 ? 'animate-pulse' : ''}
              style={{
                transition: 'all 0.3s ease-in-out'
              }}
            />
          );
        })}
      </svg>

      {isProcessing && (
        <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <p className="text-xs font-mono text-primary animate-pulse">LIVE_INFERENCE</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NeuralNetworkVisualization;