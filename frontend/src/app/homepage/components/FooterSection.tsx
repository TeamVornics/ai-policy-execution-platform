const FooterSection = () => {
  const currentYear = new Date()?.getFullYear();

  return (
    <footer className="relative py-12 bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10">
              <svg
                viewBox="0 0 40 40"
                className="w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="footerLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#00FFFF', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#8A2BE2', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                <path
                  d="M20 5 L35 15 L35 25 L20 35 L5 25 L5 15 Z"
                  fill="none"
                  stroke="url(#footerLogoGradient)"
                  strokeWidth="2"
                />
                <circle cx="20" cy="20" r="6" fill="#00FFFF" />
                <path
                  d="M20 14 L20 8 M20 32 L20 26 M14 20 L8 20 M32 20 L26 20"
                  stroke="#8A2BE2"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold font-orbitron text-primary">
                PolicyVision3D
              </span>
              <span className="text-xs font-jetbrains text-muted-foreground">
                v2.0.1 | WebGL Powered
              </span>
            </div>
          </div>

          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground font-inter">
              &copy; {currentYear} PolicyVision3D. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground font-jetbrains mt-1">
              Transforming government technology through 3D innovation
            </p>
          </div>

          <div className="flex items-center space-x-4 text-sm font-jetbrains text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span>System Online</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;