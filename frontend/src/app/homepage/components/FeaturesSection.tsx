'use client';

import { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Feature {
  id: number;
  icon: string;
  title: string;
  description: string;
  color: string;
  glowClass: string;
}

const FeaturesSection = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const features: Feature[] = [
    {
      id: 1,
      icon: 'CloudArrowUpIcon',
      title: '3D Upload Experience',
      description: 'Transform file uploads into magical holographic interactions with real-time visual feedback',
      color: 'text-primary',
      glowClass: 'box-glow-cyan',
    },
    {
      id: 2,
      icon: 'CpuChipIcon',
      title: 'AI Processing Theater',
      description: 'Watch neural networks extract rules in real-time through stunning 3D visualizations',
      color: 'text-secondary',
      glowClass: 'box-glow-purple',
    },
    {
      id: 3,
      icon: 'DocumentMagnifyingGlassIcon',
      title: 'Interactive Review Arena',
      description: 'Resolve ambiguities through intuitive 3D form interfaces that make complexity simple',
      color: 'text-accent',
      glowClass: 'box-glow-pink',
    },
    {
      id: 4,
      icon: 'ChartBarIcon',
      title: 'Results Victory Chamber',
      description: 'Celebrate transformation success with dramatic before/after 3D morphing animations',
      color: 'text-success',
      glowClass: 'elevation-subtle',
    },
    {
      id: 5,
      icon: 'Squares2X2Icon',
      title: 'Mission Control Dashboard',
      description: 'Monitor performance with real-time 3D analytics and enterprise-grade scalability',
      color: 'text-warning',
      glowClass: 'elevation-subtle',
    },
    {
      id: 6,
      icon: 'BoltIcon',
      title: '60 FPS Performance',
      description: 'Optimized WebGL rendering with automatic quality adjustment for flawless experiences',
      color: 'text-primary',
      glowClass: 'box-glow-cyan',
    },
  ];

  if (!isHydrated) {
    return (
      <section className="relative py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-4 text-glow-cyan">
              Revolutionary Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience policy processing like never before with cutting-edge 3D technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="relative p-8 bg-card rounded-lg border border-border transition-all duration-300"
              >
                <div className={`inline-flex p-4 bg-muted rounded-lg mb-6 ${feature.color}`}>
                  <Icon name={feature.icon as any} size={32} />
                </div>
                <h3 className="text-2xl font-orbitron font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-24 bg-background">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-orbitron font-bold mb-4 text-glow-cyan">
            Revolutionary Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience policy processing like never before with cutting-edge 3D technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              onMouseEnter={() => setHoveredFeature(feature.id)}
              onMouseLeave={() => setHoveredFeature(null)}
              className={`relative p-8 bg-card rounded-lg border border-border transition-all duration-300 spring-animation hover:scale-105 cursor-pointer ${
                hoveredFeature === feature.id ? feature.glowClass : ''
              }`}
            >
              <div
                className={`inline-flex p-4 bg-muted rounded-lg mb-6 ${feature.color} transition-transform duration-300 ${
                  hoveredFeature === feature.id ? 'scale-110 rotate-6' : ''
                }`}
              >
                <Icon name={feature.icon as any} size={32} />
              </div>
              <h3 className="text-2xl font-orbitron font-bold mb-4">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>

              {hoveredFeature === feature.id && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`absolute w-1 h-1 ${feature.color} rounded-full animate-pulse`}
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 0.5}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;