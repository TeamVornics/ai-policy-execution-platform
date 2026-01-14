import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import StatsSection from './components/StatsSection';
import CTASection from './components/CTASection';
import FooterSection from './components/FooterSection';

export const metadata: Metadata = {
  title: 'Homepage - PolicyVision3D',
  description: 'Transform traditional policy document processing into a cinematic, interactive 3D experience. PolicyVision3D is a revolutionary web application that makes AI-powered policy analysis feel like operating NASA mission control through unprecedented visual innovation.',
};

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="pt-16">
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <CTASection />
        <FooterSection />
      </main>
    </>
  );
}