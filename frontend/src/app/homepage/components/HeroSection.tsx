'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const HeroSection = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isHydrated]);

  if (!isHydrated) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-orbitron font-bold mb-6 text-glow-cyan">
            Policy Processing
            <br />
            <span className="text-primary">Reimagined in 3D</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto font-inter">
            Where AI meets artistry in government technology. Transform bureaucracy through beautiful, interactive 3D experiences.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/upload"
              className="group relative px-8 py-4 bg-primary text-primary-foreground rounded-lg font-rajdhani font-bold text-lg box-glow-cyan hover:scale-105 transition-transform duration-200 spring-animation"
            >
              <span className="flex items-center space-x-2">
                <Icon name="CloudArrowUpIcon" size={24} />
                <span>Start Processing</span>
              </span>
            </Link>

            <Link
              href="/dashboard"
              className="px-8 py-4 bg-card text-foreground border border-border rounded-lg font-rajdhani font-bold text-lg hover:border-primary hover:text-primary transition-all duration-200 spring-animation"
            >
              <span className="flex items-center space-x-2">
                <Icon name="ChartBarIcon" size={24} />
                <span>View Dashboard</span>
              </span>
            </Link>
          </div>

          <div className="mt-16 flex items-center justify-center space-x-8 text-sm font-jetbrains text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full" />
              <span>60 FPS</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="BoltIcon" size={16} />
              <span>Real-time Processing</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl transition-transform duration-1000"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
          }}
        />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl transition-transform duration-1000"
          style={{
            transform: `translate(${-mousePosition.x * 0.03}px, ${-mousePosition.y * 0.03}px)`,
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl transition-transform duration-1000"
          style={{
            transform: `translate(calc(-50% + ${mousePosition.x * 0.01}px), calc(-50% + ${mousePosition.y * 0.01}px))`,
          }}
        />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
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

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-orbitron font-bold mb-6 text-glow-cyan animate-fade-in">
          Policy Processing
          <br />
          <span className="text-primary">Reimagined in 3D</span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto font-inter">
          Where AI meets artistry in government technology. Transform bureaucracy through beautiful, interactive 3D experiences.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            href="/upload"
            className="group relative px-8 py-4 bg-primary text-primary-foreground rounded-lg font-rajdhani font-bold text-lg box-glow-cyan hover:scale-105 transition-transform duration-200 spring-animation"
          >
            <span className="flex items-center space-x-2">
              <Icon name="CloudArrowUpIcon" size={24} />
              <span>Start Processing</span>
            </span>
            <div className="absolute inset-0 bg-primary/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300" />
          </Link>

          <Link
            href="/dashboard"
            className="px-8 py-4 bg-card text-foreground border border-border rounded-lg font-rajdhani font-bold text-lg hover:border-primary hover:text-primary transition-all duration-200 spring-animation hover:box-glow-cyan"
          >
            <span className="flex items-center space-x-2">
              <Icon name="ChartBarIcon" size={24} />
              <span>View Dashboard</span>
            </span>
          </Link>
        </div>

        <div className="mt-16 flex items-center justify-center space-x-8 text-sm font-jetbrains text-muted-foreground">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span>60 FPS</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="BoltIcon" size={16} />
            <span>Real-time Processing</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;