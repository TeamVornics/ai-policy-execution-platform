import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import ReviewInteractive from './components/ReviewInteractive';

export const metadata: Metadata = {
  title: 'Review - PolicyVision3D',
  description: 'Review and complete extracted policy information with intuitive 3D form interfaces. Resolve ambiguities through interactive guidance and submit for final processing.',
};

export default function ReviewPage() {
  return (
    <>
      <Header />
      <ReviewInteractive />
    </>
  );
}