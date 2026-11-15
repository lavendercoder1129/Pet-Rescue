import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-forest-subtle flex items-center justify-center text-forest">
        <Compass className="w-8 h-8 animate-pulse" />
      </div>
      <h1 className="text-4xl font-serif font-bold text-forest">Page Not Found</h1>
      <p className="text-charcoal-muted leading-relaxed">
        The page you are looking for does not exist or may have been moved.
      </p>
      <div className="pt-4">
        <Link to="/" className="btn-primary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Return to Overview
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
