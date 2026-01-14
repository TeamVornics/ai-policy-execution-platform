import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import UploadInteractive from './components/UploadInteractive';

export const metadata: Metadata = {
  title: 'Upload Command Center - PolicyVision3D',
  description: 'Transform your policy documents into actionable insights with AI-powered analysis. Upload files or try sample documents to experience holographic 3D visualization and intelligent rule extraction.',
};

export default function UploadPage() {
  return (
    <>
      <Header />
      <UploadInteractive />
    </>
  );
}