'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface AmbiguityCardProps {
  id: string;
  fieldName: string;
  originalValue: string;
  suggestedValues: string[];
  context: string;
  onResolve: (id: string, clarification: {
    responsible_role: string;
    deadline?: string;
    conditions?: string[];
  }) => void;
}

const AmbiguityCard = ({
  id,
  fieldName,
  originalValue,
  suggestedValues,
  context,
  onResolve,
}: AmbiguityCardProps) => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [deadline, setDeadline] = useState<string>('');
  const [conditions, setConditions] = useState<string>('');
  const [isHydrated, setIsHydrated] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="bg-card border-2 border-warning rounded-lg p-6 elevation-subtle">
        <div className="h-32 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  const handleResolve = () => {
    if (selectedRole) {
      setShowConfetti(true);
      setTimeout(() => {
        const clarification = {
          responsible_role: selectedRole,
          deadline: deadline || undefined,
          conditions: conditions ? conditions.split(',').map(c => c.trim()).filter(c => c) : undefined
        };
        onResolve(id, clarification);
      }, 500);
    }
  };

  return (
    <div className="relative bg-card border-2 border-warning rounded-lg p-6 elevation-subtle transition-all duration-300 hover:scale-[1.02] spring-animation">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-success rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="flex items-start space-x-3 mb-4">
        <div className="flex-shrink-0 w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center">
          <Icon name="ExclamationTriangleIcon" size={24} variant="solid" className="text-warning" />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-orbitron font-bold text-foreground mb-1">
            Ambiguity Detected
          </h4>
          <p className="text-sm font-inter text-muted-foreground">{context}</p>
        </div>
      </div>

      <div className="mb-4 p-4 bg-muted rounded-lg">
        <p className="text-xs font-jetbrains text-muted-foreground mb-1">Original Value:</p>
        <p className="text-sm font-inter text-foreground font-semibold">{originalValue}</p>
      </div>

      <div className="space-y-4 mb-4">
        <div>
          <p className="text-xs font-jetbrains text-muted-foreground mb-2">
            Select Responsible Role: <span className="text-warning">*</span>
          </p>
          <div className="space-y-2">
            {suggestedValues.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedRole(value)}
                className={`
                  w-full p-3 rounded-lg text-left transition-all duration-200 spring-animation
                  ${selectedRole === value
                    ? 'bg-primary text-primary-foreground border-2 border-primary box-glow-cyan scale-[1.02]'
                    : 'bg-card border-2 border-border hover:border-primary hover:bg-muted'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="font-inter text-sm">{value}</span>
                  {selectedRole === value && (
                    <Icon name="CheckCircleIcon" size={20} variant="solid" className="text-primary-foreground" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-jetbrains text-muted-foreground mb-2 block">
            Clarified Deadline (Optional):
          </label>
          <input
            type="text"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            placeholder="e.g., 30 days, March 31st, etc."
            className="w-full p-3 rounded-lg bg-card border-2 border-border focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-jetbrains text-muted-foreground mb-2 block">
            Clarified Conditions (Optional, comma-separated):
          </label>
          <textarea
            value={conditions}
            onChange={(e) => setConditions(e.target.value)}
            placeholder="e.g., Income < ₹2,00,000, Age > 18"
            rows={2}
            className="w-full p-3 rounded-lg bg-card border-2 border-border focus:border-primary focus:outline-none transition-colors resize-none"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleResolve}
        disabled={!selectedRole}
        className={`
          w-full px-6 py-3 rounded-lg font-rajdhani font-bold text-sm
          transition-all duration-200 spring-animation
          ${selectedRole
            ? 'bg-success text-success-foreground hover:scale-105 box-glow-cyan'
            : 'bg-muted text-muted-foreground cursor-not-allowed'
          }
        `}
      >
        {selectedRole ? 'Submit Clarification' : 'Select Responsible Role'}
      </button>
    </div>
  );
};

export default AmbiguityCard;