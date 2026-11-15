import Navbar from './Navbar';
import Footer from './Footer';

export const PageLayout = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen flex flex-col bg-ivory text-charcoal ${className}`}>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PageLayout;
