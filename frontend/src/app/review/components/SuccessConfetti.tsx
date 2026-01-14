import React from 'react';

interface SuccessConfettiProps {
    show: boolean;
}

const SuccessConfetti = ({ show }: SuccessConfettiProps) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {/* Confetti placeholder - logic to be implemented if needed */}
            <div className="absolute inset-0 bg-primary/5 animate-pulse" />
        </div>
    );
};

export default SuccessConfetti;
