import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import ResultsInteractive from './components/ResultsInteractive';

export const metadata: Metadata = {
  title: 'Results Victory Chamber - PolicyVision3D',
  description:
    'View your transformed policy documents with dramatic before/after visualizations, quality metrics, and export options in an immersive 3D environment.',
};

export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-success/10 rounded-full mb-4">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-sm font-jetbrains text-success">Processing Complete</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-orbitron text-foreground text-glow-cyan mb-4">
              Results Victory Chamber
            </h1>
            <p className="text-lg text-muted-foreground font-inter max-w-3xl mx-auto">
              Your policy document has been transformed through AI-powered processing. \
              Review the dramatic improvements, quality metrics, and export your results.
            </p>
          </div>

          <ResultsInteractive />
        </div>
      </main>

      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-sm font-jetbrains text-muted-foreground">
              System Status: Operational | 60 FPS
            </span>
          </div>
          <p className="text-sm text-muted-foreground font-jetbrains">
            &copy; {new Date().getFullYear()} PolicyVision3D. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}