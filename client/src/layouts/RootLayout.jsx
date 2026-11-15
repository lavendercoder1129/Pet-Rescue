import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AnnouncementBanner from '../components/common/AnnouncementBanner';

export const RootLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-ivory text-charcoal">
      <AnnouncementBanner />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
