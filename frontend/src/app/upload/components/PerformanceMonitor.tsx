import React from 'react';

const PerformanceMonitor = () => {
    return (
        <div className="hidden md:flex items-center space-x-2 bg-secondary/50 px-3 py-1.5 rounded-full border border-border">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-mono text-muted-foreground">System Optimal</span>
        </div>
    );
};

export default PerformanceMonitor;
