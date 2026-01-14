'use client';

import { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Stat {
  id: number;
  value: string;
  label: string;
  icon: string;
  color: string;
}

const StatsSection = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const section = document.getElementById('stats-section');
    if (section) {
      observer.observe(section);
    }

    return () => {
      if (section) {
        observer.unobserve(section);
      }
    };
  }, [isHydrated]);

  const stats: Stat[] = [
    {
      id: 1,
      value: '60',
      label: 'FPS Performance',
      icon: 'BoltIcon',
      color: 'text-primary',
    },
    {
      id: 2,
      value: '3D',
      label: 'WebGL Rendering',
      icon: 'CubeIcon',
      color: 'text-secondary',
    },
    {
      id: 3,
      value: '100%',
      label: 'Accuracy Rate',
      icon: 'CheckCircleIcon',
      color: 'text-success',
    },
    {
      id: 4,
      value: '10x',
      label: 'Faster Processing',
      icon: 'RocketLaunchIcon',
      color: 'text-accent',
    },
  ];

  if (!isHydrated) {
    return (
      <section id="stats-section" className="relative py-24 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.id} className="text-center">
                <div className={`inline-flex p-4 bg-muted rounded-lg mb-4 ${stat.color}`}>
                  <Icon name={stat.icon as any} size={32} />
                </div>
                <div className={`text-5xl font-orbitron font-bold mb-2 ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-rajdhani">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="stats-section" className="relative py-24 bg-card overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.id}
              className={`text-center transition-all duration-700 ${
                isVisible
                  ? 'opacity-100 translate-y-0' :'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div
                className={`inline-flex p-4 bg-muted rounded-lg mb-4 ${stat.color} transition-transform duration-300 hover:scale-110 hover:rotate-6`}
              >
                <Icon name={stat.icon as any} size={32} />
              </div>
              <div
                className={`text-5xl font-orbitron font-bold mb-2 ${stat.color} text-glow-cyan`}
              >
                {stat.value}
              </div>
              <div className="text-muted-foreground font-rajdhani">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;