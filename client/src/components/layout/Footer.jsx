import { Link } from 'react-router-dom';
import { AlertCircle, HeartHandshake, Mail, MapPin, Phone, Github, ShieldCheck } from 'lucide-react';
import Container from './Container';

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-grey-light bg-ivory-warm/80 text-charcoal">
      <Container className="py-14 sm:py-16">
        {/* Academic Simulation Banner */}
        <div className="rounded-2xl p-4.5 sm:p-5 mb-12 bg-amber-50/95 border border-amber-200/80 flex items-start gap-3.5 shadow-warm-sm">
          <AlertCircle className="w-5 h-5 text-amber-800 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed space-y-1">
            <p>
              <strong className="font-semibold">Academic Simulation Notice:</strong> This web application is strictly an educational student simulation project for animal welfare management.
            </p>
            <p className="text-amber-800/90 text-[11px]">
              No live financial payments, UPI transfers, payment gateways (Razorpay, Stripe, PayPal), or real emergency dispatches are executed. All monetary figures and campaign stories are demonstration mockups.
            </p>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
          {/* Brand & Mission Statement */}
          <div className="lg:col-span-5 space-y-4">
            <Link to="/" className="flex items-center space-x-3.5 group">
              <div className="w-10 h-10 rounded-xl bg-forest flex items-center justify-center text-ivory shadow-warm-sm group-hover:bg-forest-light transition-colors">
                <HeartHandshake className="w-5 h-5 text-sage-light" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-forest block leading-none">
                  Pet Rescue
                </span>
                <span className="text-[11px] font-sans text-charcoal-muted uppercase tracking-widest block mt-1 font-medium">
                  Emergency Stray Animal Platform
                </span>
              </div>
            </Link>

            <p className="text-sm text-charcoal-muted max-w-sm leading-relaxed font-sans">
              A transparent emergency reporting and simulated crowdfunding platform helping injured, sick, and vulnerable stray animals receive urgent medical treatment.
            </p>

            {/* Social Media Placeholders */}
            <div className="pt-2 flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                Connect:
              </span>
              <a
                href="https://github.com/lavendercoder1129/Pet-Rescue"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-white border border-grey-light flex items-center justify-center text-charcoal-muted hover:text-forest hover:border-forest transition-colors shadow-warm-sm"
                title="GitHub Repository"
              >
                <Github className="w-4 h-4" />
              </a>
              <span
                className="w-8 h-8 rounded-lg bg-white border border-grey-light flex items-center justify-center text-charcoal-muted/50 cursor-not-allowed shadow-warm-sm"
                title="Placeholder Social Account"
              >
                <span className="text-xs font-mono font-bold">𝕏</span>
              </span>
              <span
                className="w-8 h-8 rounded-lg bg-white border border-grey-light flex items-center justify-center text-charcoal-muted/50 cursor-not-allowed shadow-warm-sm"
                title="Placeholder Social Account"
              >
                <span className="text-xs font-mono font-bold">IG</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-charcoal font-sans">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-charcoal-muted">
              <li>
                <Link to="/" className="hover:text-forest transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/cases" className="hover:text-forest transition-colors">Emergency Cases</Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-forest transition-colors">How It Works</a>
              </li>
              <li>
                <Link to="/transparency" className="hover:text-forest transition-colors">Transparency Ledger</Link>
              </li>
              <li>
                <Link to="/donor-wall" className="hover:text-forest transition-colors">Donor Wall</Link>
              </li>
            </ul>
          </div>

          {/* Platform Architecture Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-charcoal font-sans">
              Resources
            </h4>
            <ul className="space-y-2 text-sm text-charcoal-muted">
              <li>
                <Link to="/design-system" className="hover:text-forest transition-colors">UI Design System</Link>
              </li>
              <li>
                <span className="text-charcoal-muted/70 cursor-default">Triage Standards</span>
              </li>
              <li>
                <span className="text-charcoal-muted/70 cursor-default">Veterinary Guidelines</span>
              </li>
              <li>
                <span className="text-charcoal-muted/70 cursor-default">Simulated Escrow</span>
              </li>
            </ul>
          </div>

          {/* Contact Placeholder */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-charcoal font-sans">
              Contact & Inquiry (Placeholder)
            </h4>
            <ul className="space-y-2.5 text-xs text-charcoal-muted">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-sage-dark flex-shrink-0 mt-0.5" />
                <span>Indiranagar & Whitefield Field Sectors, Karnataka, India</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sage-dark flex-shrink-0" />
                <span className="font-mono">support@petrescue.simulation.example</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sage-dark flex-shrink-0" />
                <span className="font-mono">+91 080 0000 0000 (Helpline)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Design Badge */}
        <div className="pt-8 border-t border-grey-light flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-muted">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-forest" />
            <span>© 2026 Pet Rescue. Academic portfolio simulation project. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span>Modern Compassionate Editorial</span>
            <span>•</span>
            <span>React 18 + Vite + Tailwind CSS</span>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
