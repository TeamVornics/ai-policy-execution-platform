'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const CTASection = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const handleMouseMove = (e: MouseEvent) => {
      const section = document.getElementById('cta-section');
      if (section) {
        const rect = section.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isHydrated]);

  if (!isHydrated) {
    return (
      <section id="cta-section" className="relative py-32 bg-background overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-orbitron font-bold mb-6 text-glow-cyan">
            Ready to Transform Your
            <br />
            <span className="text-primary">Policy Processing?</span>
          </h2>

          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join the future of government technology. Experience the power of 3D AI-driven policy analysis today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/upload"
              className="px-10 py-5 bg-primary text-primary-foreground rounded-lg font-rajdhani font-bold text-xl box-glow-cyan hover:scale-105 transition-transform duration-200 spring-animation"
            >
              <span className="flex items-center space-x-2">
                <Icon name="CloudArrowUpIcon" size={24} />
                <span>Upload Your First Document</span>
              </span>
            </Link>

            <Link
              href="/dashboard"
              className="px-10 py-5 bg-card text-foreground border-2 border-primary rounded-lg font-rajdhani font-bold text-xl hover:bg-primary hover:text-primary-foreground transition-all duration-200 spring-animation"
            >
              <span className="flex items-center space-x-2">
                <Icon name="Squares2X2Icon" size={24} />
                <span>Explore Dashboard</span>
              </span>
            </Link>
          </div>

          <div className="mt-16 flex items-center justify-center space-x-12 text-sm font-jetbrains text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Icon name="ShieldCheckIcon" size={20} />
              <span>Secure Processing</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="ClockIcon" size={20} />
              <span>Real-time Results</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="SparklesIcon" size={20} />
              <span>AI-Powered</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="cta-section" className="relative py-32 bg-background overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl transition-all duration-300"
          style={{
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-6xl font-orbitron font-bold mb-6 text-glow-cyan">
          Ready to Transform Your
          <br />
          <span className="text-primary">Policy Processing?</span>
        </h2>

        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Join the future of government technology. Experience the power of 3D AI-driven policy analysis today.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            href="/upload"
            className="group relative px-10 py-5 bg-primary text-primary-foreground rounded-lg font-rajdhani font-bold text-xl box-glow-cyan hover:scale-105 transition-transform duration-200 spring-animation"
          >
            <span className="flex items-center space-x-2">
              <Icon name="CloudArrowUpIcon" size={24} />
              <span>Upload Your First Document</span>
            </span>
            <div className="absolute inset-0 bg-primary/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300" />
          </Link>

          <Link
            href="/dashboard"
            className="px-10 py-5 bg-card text-foreground border-2 border-primary rounded-lg font-rajdhani font-bold text-xl hover:bg-primary hover:text-primary-foreground hover:box-glow-cyan transition-all duration-200 spring-animation"
          >
            <span className="flex items-center space-x-2">
              <Icon name="Squares2X2Icon" size={24} />
              <span>Explore Dashboard</span>
            </span>
          </Link>
        </div>

        <div className="mt-16 flex items-center justify-center space-x-12 text-sm font-jetbrains text-muted-foreground">
          <div className="flex items-center space-x-2 hover:text-primary transition-colors duration-200">
            <Icon name="ShieldCheckIcon" size={20} />
            <span>Secure Processing</span>
          </div>
          <div className="flex items-center space-x-2 hover:text-primary transition-colors duration-200">
            <Icon name="ClockIcon" size={20} />
            <span>Real-time Results</span>
          </div>
          <div className="flex items-center space-x-2 hover:text-primary transition-colors duration-200">
            <Icon name="SparklesIcon" size={20} />
            <span>AI-Powered</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;