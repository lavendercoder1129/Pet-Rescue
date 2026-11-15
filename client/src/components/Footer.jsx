import { AlertCircle, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-ivory-border bg-ivory-warm/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Academic Simulation Banner */}
        <div className="rounded-xl p-4 mb-8 bg-amber-50/80 border border-amber-200/60 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-semibold">Academic Simulation Notice:</span> This application is developed strictly for educational and simulation purposes. No real financial payments, UPI transfers, Razorpay/Stripe integrations, or live banking facilities will ever be processed.
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-charcoal-muted">
          <div className="flex items-center gap-1.5">
            <span>Built with care for animal welfare</span>
            <Heart className="w-3.5 h-3.5 text-orange-muted fill-orange-muted" />
            <span>— Pet Rescue Project Foundation</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Palette: Forest Green & Sage & Warm Ivory</span>
            <span>React + Vite + Tailwind + Express + MongoDB</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
