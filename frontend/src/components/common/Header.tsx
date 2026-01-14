'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

interface NavigationItem {
  name: string;
  href: string;
  icon: string;
}

const Header = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems: NavigationItem[] = [
    { name: 'Home', href: '/homepage', icon: 'HomeIcon' },
    { name: 'Upload', href: '/upload', icon: 'CloudArrowUpIcon' },
    { name: 'Processing', href: '/processing', icon: 'CpuChipIcon' },
    { name: 'Review', href: '/review', icon: 'DocumentMagnifyingGlassIcon' },
    { name: 'Results', href: '/results', icon: 'ChartBarIcon' },
  ];

  const moreItems: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: 'Squares2X2Icon' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card shadow-md">
      <div className="flex items-center justify-between h-16 px-6">
        <Link href="/homepage" className="flex items-center space-x-3 group">
          <div className="relative w-10 h-10">
            <svg
              viewBox="0 0 40 40"
              className="w-full h-full transition-transform duration-300 group-hover:scale-110"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#00FFFF', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#8A2BE2', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <path
                d="M20 5 L35 15 L35 25 L20 35 L5 25 L5 15 Z"
                fill="none"
                stroke="url(#logoGradient)"
                strokeWidth="2"
                className="box-glow-cyan"
              />
              <circle cx="20" cy="20" r="6" fill="#00FFFF" className="animate-pulse-glow" />
              <path
                d="M20 14 L20 8 M20 32 L20 26 M14 20 L8 20 M32 20 L26 20"
                stroke="#8A2BE2"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold font-orbitron text-primary text-glow-cyan">
              PolicyVision3D
            </span>
            <span className="text-xs font-jetbrains text-muted-foreground">
              v2.0.1
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center space-x-1">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                relative px-4 py-2 rounded-lg font-rajdhani font-semibold text-sm
                transition-all duration-200 spring-animation
                ${isActive(item.href)
                  ? 'bg-primary text-primary-foreground box-glow-cyan'
                  : 'text-foreground hover:bg-muted hover:text-primary'
                }
              `}
            >
              <span className="flex items-center space-x-2">
                <Icon name={item.icon as any} size={18} />
                <span>{item.name}</span>
              </span>
              {isActive(item.href) && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-shimmer" />
              )}
            </Link>
          ))}

          <div className="relative group">
            <button className="px-4 py-2 rounded-lg font-rajdhani font-semibold text-sm text-foreground hover:bg-muted hover:text-primary transition-all duration-200 spring-animation flex items-center space-x-2">
              <Icon name="EllipsisHorizontalIcon" size={18} />
              <span>More</span>
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-card rounded-lg shadow-lg elevation-subtle opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              {moreItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    block px-4 py-3 font-rajdhani font-semibold text-sm
                    transition-all duration-200
                    ${isActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted hover:text-primary'
                    }
                    first:rounded-t-lg last:rounded-b-lg
                  `}
                >
                  <span className="flex items-center space-x-2">
                    <Icon name={item.icon as any} size={18} />
                    <span>{item.name}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="hidden lg:flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-muted rounded-lg">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-xs font-jetbrains text-muted-foreground">60 FPS</span>
          </div>
          <Link href="/upload">
            <button className="px-5 py-2 bg-accent text-accent-foreground rounded-lg font-rajdhani font-bold text-sm box-glow-pink hover:scale-105 transition-transform duration-200 spring-animation">
              Get Started
            </button>
          </Link>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-foreground hover:text-primary transition-colors"
        >
          <Icon name={mobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'} size={24} />
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-card">
          <nav className="px-4 py-4 space-y-2">
            {[...navigationItems, ...moreItems].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  block px-4 py-3 rounded-lg font-rajdhani font-semibold text-sm
                  transition-all duration-200
                  ${isActive(item.href)
                    ? 'bg-primary text-primary-foreground box-glow-cyan'
                    : 'text-foreground hover:bg-muted hover:text-primary'
                  }
                `}
              >
                <span className="flex items-center space-x-2">
                  <Icon name={item.icon as any} size={18} />
                  <span>{item.name}</span>
                </span>
              </Link>
            ))}
            <div className="pt-4 border-t border-border">
              <Link href="/upload" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full px-5 py-3 bg-accent text-accent-foreground rounded-lg font-rajdhani font-bold text-sm box-glow-pink">
                  Get Started
                </button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;