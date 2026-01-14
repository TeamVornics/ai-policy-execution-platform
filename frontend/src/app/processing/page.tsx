import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import ProcessingInteractive from './components/ProcessingInteractive';

export const metadata: Metadata = {
  title: 'AI Processing Theater - PolicyVision3D',
  description: 'Watch real-time 3D neural network visualization as AI extracts and analyzes policy rules with advanced machine learning algorithms.',
};

export default function ProcessingPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <ProcessingInteractive />
      </main>
    </>
  );
}