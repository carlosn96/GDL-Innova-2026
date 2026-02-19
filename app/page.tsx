'use client';

import { useScrollProgress, useMagneticHover, useCursorTrail } from '@/lib/hooks';
import Navigation from '../components/Navigation';
import HeroSection from '../components/features/hero/HeroSection';
import About from '../components/About';
import Schedule from '../components/Schedule';
import Tracks from '../components/Tracks';
import Tech from '../components/Tech';
import Evaluation from '../components/Evaluation';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

export default function Home() {
  useScrollProgress();
  useMagneticHover();
  useCursorTrail();

  return (
    <main>
      <Navigation />
      <HeroSection />
      <About />
      <Schedule />
      <Tracks />
      <Tech />
      <Evaluation />
      <CTA />
      <Footer />
    </main>
  );
}
