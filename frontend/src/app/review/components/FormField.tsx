'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface FormFieldProps {
  id: string;
  label: string;
  type: 'text' | 'select' | 'textarea' | 'date' | 'number';
  value: string;
  options?: string[];
  required?: boolean;
  hasAmbiguity?: boolean;
  ambiguityMessage?: string;
  placeholder?: string;
  onChange: (id: string, value: string) => void;
  onResolveAmbiguity?: (id: string) => void;
}

const FormField = ({
  id,
  label,
  type,
  value,
  options = [],
  required = false,
  hasAmbiguity = false,
  ambiguityMessage = '',
  placeholder = '',
  onChange,
  onResolveAmbiguity,
}: FormFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="mb-6">
        <label className="block text-sm font-rajdhani font-semibold text-foreground mb-2">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
        <div className="w-full h-12 bg-muted rounded-lg" />
      </div>
    );
  }

  const handleChange = (newValue: string) => {
    onChange(id, newValue);
  };

  const renderInput = () => {
    const baseClasses = `
      w-full px-4 py-3 bg-card border-2 rounded-lg
      font-inter text-foreground placeholder-muted-foreground
      transition-all duration-300 spring-animation
      focus:outline-none focus:ring-2 focus:ring-primary
      ${isFocused ? 'border-primary box-glow-cyan scale-[1.02]' : 'border-border'}
      ${hasAmbiguity ? 'border-warning' : ''}
    `;

    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={id}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            required={required}
            rows={4}
            className={baseClasses}
          />
        );

      case 'select':
        return (
          <select
            id={id}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            required={required}
            className={baseClasses}
          >
            <option value="">Select an option</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            id={id}
            type={type}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            required={required}
            className={baseClasses}
          />
        );
    }
  };

  return (
    <div className="mb-6 relative">
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor={id}
          className="block text-sm font-rajdhani font-semibold text-foreground"
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
        {hasAmbiguity && (
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="flex items-center space-x-1 text-warning hover:text-warning/80 transition-colors"
            >
              <Icon name="ExclamationTriangleIcon" size={16} variant="solid" />
              <span className="text-xs font-jetbrains">Ambiguity Detected</span>
            </button>
            {showTooltip && (
              <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-card border-2 border-warning rounded-lg shadow-lg elevation-subtle z-10">
                <p className="text-xs font-inter text-foreground">{ambiguityMessage}</p>
                {onResolveAmbiguity && (
                  <button
                    type="button"
                    onClick={() => onResolveAmbiguity(id)}
                    className="mt-2 w-full px-3 py-1.5 bg-warning text-warning-foreground rounded-lg text-xs font-rajdhani font-bold hover:scale-105 transition-transform duration-200"
                  >
                    Resolve Now
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {renderInput()}
      {isFocused && (
        <div className="absolute -inset-1 bg-primary/10 rounded-lg -z-10 animate-pulse" />
      )}
    </div>
  );
};

export default FormField;