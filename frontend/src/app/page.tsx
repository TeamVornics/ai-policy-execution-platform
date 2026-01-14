import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import HeroSection from './homepage/components/HeroSection';
import FeaturesSection from './homepage/components/FeaturesSection';
import StatsSection from './homepage/components/StatsSection';
import CTASection from './homepage/components/CTASection';
import FooterSection from './homepage/components/FooterSection';

export const metadata: Metadata = {
    title: 'PolicyVision3D - AI Policy Processing',
    description: 'Transform traditional policy document processing into a cinematic, interactive 3D experience.',
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
