import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import DashboardInteractive from './components/DashboardInteractive';

export const metadata: Metadata = {
  title: 'Mission Control Dashboard - PolicyVision3D',
  description: 'Real-time system monitoring, analytics, and performance metrics for PolicyVision3D. Track document processing, user activity, API usage, and system health in an immersive 3D interface.',
};

export default function DashboardPage() {
  return (
    <>
      <Header />
      <DashboardInteractive />
    </>
  );
}