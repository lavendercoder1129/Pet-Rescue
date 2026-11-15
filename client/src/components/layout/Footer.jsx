import { AlertCircle, Heart } from 'lucide-react';
import Container from './Container';

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-grey-light bg-ivory-warm/70">
      <Container className="py-12">
        {/* Academic Simulation Banner */}
        <div className="rounded-xl p-4.5 mb-10 bg-amber-50/90 border border-amber-200/70 flex items-start gap-3.5 shadow-warm-sm">
          <AlertCircle className="w-5 h-5 text-amber-800 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-semibold">Academic Simulation Notice:</span> This application is created strictly for academic and portfolio demonstration. No real financial payments, live UPI transactions, payment gateways (Razorpay, Stripe), or real rescue requests are executed.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2 space-y-3">
            <span className="font-serif text-2xl font-bold text-forest">
              Pet Rescue
            </span>
            <p className="text-sm text-charcoal-muted max-w-sm leading-relaxed">
              Modern emergency rescue coordination and transparent simulated crowdfunding for injured street animals in need of medical treatment.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-semibold tracking-wider uppercase text-charcoal-soft mb-3 font-sans">
              Platform
            </h2>
            <ul className="space-y-2 text-sm text-charcoal-muted">
              <li>Emergency Cases</li>
              <li>Triage Process</li>
              <li>Veterinary Verification</li>
              <li>Simulated Fund Tracker</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold tracking-wider uppercase text-charcoal-soft mb-3 font-sans">
              Transparency
            </h2>
            <ul className="space-y-2 text-sm text-charcoal-muted">
              <li>Medical Bill Audits</li>
              <li>Treatment Milestones</li>
              <li>Donor Recognition Wall</li>
              <li>Design System Specification</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-grey-light flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-muted">
          <div className="flex items-center gap-1.5">
            <span>Built with care for animal protection</span>
            <Heart className="w-3.5 h-3.5 text-orange-muted fill-orange-muted" />
            <span>— Modern Compassionate Editorial</span>
          </div>

          <div className="flex items-center gap-6">
            <span>React + Vite + Tailwind CSS</span>
            <span>Design System v1.0</span>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
