import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import HeroSection from '../components/home/HeroSection';
import ImpactStats from '../components/home/ImpactStats';
import EmergencyCases from '../components/home/EmergencyCases';
import HowItWorks from '../components/home/HowItWorks';
import TransparencySection from '../components/home/TransparencySection';
import RescueStory from '../components/home/RescueStory';
import FinalCTA from '../components/home/FinalCTA';

export const HomePage = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [hash]);

  return (
    <div className="space-y-0">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Impact Statistics */}
      <ImpactStats />

      {/* 3. Emergency Rescue Cases */}
      <EmergencyCases />

      {/* 4. How It Works */}
      <HowItWorks />

      {/* 5. Transparency Section */}
      <TransparencySection />

      {/* 6. Rescue Story / Emotional Section */}
      <RescueStory />

      {/* 7. Final Call to Action */}
      <FinalCTA />
    </div>
  );
};

export default HomePage;
