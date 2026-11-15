import { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  Layers, 
  ShieldCheck, 
  Database, 
  Server, 
  Layout, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { checkHealth } from '../services/api';

export const HomePage = () => {
  const [serverStatus, setServerStatus] = useState({
    loading: true,
    healthy: false,
    data: null,
    error: null,
  });

  useEffect(() => {
    let mounted = true;
    const fetchStatus = async () => {
      try {
        const res = await checkHealth();
        if (mounted) {
          setServerStatus({
            loading: false,
            healthy: true,
            data: res,
            error: null,
          });
        }
      } catch (err) {
        if (mounted) {
          setServerStatus({
            loading: false,
            healthy: false,
            data: null,
            error: err.message || 'Server offline',
          });
        }
      }
    };

    fetchStatus();
    return () => { mounted = false; };
  }, []);

  const colorSwatches = [
    { name: 'Forest Green', hex: '#244C3A', role: 'Primary Brand / Authority / Deep Trust', bg: 'bg-[#244C3A]', text: 'text-white' },
    { name: 'Sage', hex: '#A8B9A0', role: 'Accent / Balance / Healing Harmony', bg: 'bg-[#A8B9A0]', text: 'text-charcoal' },
    { name: 'Warm Ivory', hex: '#FAF8F2', role: 'Background Canvas / Editorial Paper', bg: 'bg-[#FAF8F2]', text: 'text-charcoal', border: 'border border-ivory-border' },
    { name: 'Muted Orange', hex: '#D98B54', role: 'Urgency & Call-to-Action / Warmth', bg: 'bg-[#D98B54]', text: 'text-white' },
    { name: 'Charcoal', hex: '#252A27', role: 'Typography / Structural Elegance', bg: 'bg-[#252A27]', text: 'text-white' },
  ];

  const modules = [
    { id: '00', title: 'Foundation & GitHub Connection', status: 'Completed', current: true },
    { id: '01', title: 'Authentication & Role Management', status: 'Upcoming', current: false },
    { id: '02', title: 'Emergency Rescue Case Reporting', status: 'Upcoming', current: false },
    { id: '03', title: 'Admin Case Verification & Workflow', status: 'Upcoming', current: false },
    { id: '04', title: 'Simulated Donation & Escrow System', status: 'Upcoming', current: false },
    { id: '05', title: 'Expenditure Proofs & Fund Tracking', status: 'Upcoming', current: false },
    { id: '06', title: 'Treatment Progress & Public Updates', status: 'Upcoming', current: false },
    { id: '07', title: 'Donor Recognition & Transparency', status: 'Upcoming', current: false },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-subtle text-forest text-xs font-semibold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                Modern Compassionate Editorial
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-forest leading-[1.15]">
                A compassionate lifeline for injured stray animals.
              </h1>

              <p className="text-lg text-charcoal-soft font-sans leading-relaxed max-w-2xl">
                Pet Rescue coordinates rapid emergency reporting, community medical fund allocation, and complete expenditure transparency — empowering rescuers and caring donors to give street animals the urgent treatment they deserve.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a 
                  href="#roadmap" 
                  className="btn-primary"
                >
                  View Implementation Roadmap
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>

                <a 
                  href="#palette" 
                  className="btn-secondary"
                >
                  Design Foundation
                </a>
              </div>

              {/* Status pill bar */}
              <div className="pt-4 flex items-center gap-4 text-xs font-medium text-charcoal-muted">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Module 0 Initialized</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-sage-dark" />
                  <span>Vite + React 18 + Tailwind</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-sage-dark" />
                  <span>Express & Mongoose</span>
                </div>
              </div>
            </div>

            {/* Right Card: Live API & Foundation State */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-ivory-border shadow-warm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-ivory-border">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-forest" />
                    <span className="font-serif font-semibold text-charcoal text-lg">System Health Status</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    serverStatus.loading 
                      ? 'bg-amber-100 text-amber-800' 
                      : serverStatus.healthy 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-rose-100 text-rose-800'
                  }`}>
                    {serverStatus.loading ? 'Checking...' : serverStatus.healthy ? 'API Connected' : 'API Standby'}
                  </span>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div className="flex items-center justify-between py-1.5 border-b border-ivory-border/50">
                    <span className="text-charcoal-muted flex items-center gap-2">
                      <Layout className="w-4 h-4 text-sage-dark" /> Frontend
                    </span>
                    <span className="font-medium text-charcoal">Vite 5 / React 18 / Tailwind</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-ivory-border/50">
                    <span className="text-charcoal-muted flex items-center gap-2">
                      <Server className="w-4 h-4 text-sage-dark" /> Backend Server
                    </span>
                    <span className="font-medium text-charcoal">Express.js (Port 5000)</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-ivory-border/50">
                    <span className="text-charcoal-muted flex items-center gap-2">
                      <Database className="w-4 h-4 text-sage-dark" /> Database
                    </span>
                    <span className="font-medium text-charcoal">MongoDB / Mongoose 8</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-charcoal-muted flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-sage-dark" /> Auth Layer
                    </span>
                    <span className="font-medium text-charcoal">JWT Foundation Ready</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-ivory-warm/60 border border-ivory-border text-xs text-charcoal-muted leading-relaxed">
                  {serverStatus.healthy && serverStatus.data ? (
                    <div>
                      <span className="font-semibold text-forest">Backend Response:</span> {serverStatus.data.project} ({serverStatus.data.module})
                      <div className="mt-1 font-mono text-[11px] text-charcoal-soft">
                        Environment: {serverStatus.data.environment} • DB: {serverStatus.data.database.status}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="font-semibold text-charcoal">Local Development Notice:</span> Server ready at <code className="font-mono text-forest">http://localhost:5000</code>. Run with <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-ivory-border text-forest">npm run dev:server</code>.
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Visual Design Foundation Section */}
      <section id="palette" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-ivory-border pt-16">
          <div className="max-w-3xl mb-10">
            <span className="text-xs uppercase tracking-widest font-semibold text-orange-muted block mb-2">Design Tokens</span>
            <h2 className="text-3xl font-serif font-bold text-forest mb-3">Modern Compassionate Editorial Palette</h2>
            <p className="text-charcoal-muted text-sm leading-relaxed">
              Curated to evoke deep institutional trust, medical calmness, and compassionate warmth. Generous whitespace with Playfair Display serif headings and Inter interface typography.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {colorSwatches.map((color) => (
              <div 
                key={color.name} 
                className={`rounded-xl p-5 ${color.bg} ${color.text} ${color.border || ''} shadow-sm transition-transform duration-150 hover:-translate-y-1`}
              >
                <div className="h-14"></div>
                <div className="pt-2">
                  <div className="font-serif font-semibold text-base">{color.name}</div>
                  <div className="font-mono text-xs opacity-80 mt-0.5">{color.hex}</div>
                  <div className="text-[11px] mt-2 opacity-90 leading-snug">{color.role}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-editorial space-y-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-charcoal-muted">Display & Headings</span>
              <div className="font-serif text-2xl font-bold text-forest">Playfair Display</div>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Elevates emergency storytelling to an editorial standard, reinforcing institutional credibility and emotional resonance for animal protection.
              </p>
            </div>
            <div className="card-editorial space-y-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-charcoal-muted">Interface & Body</span>
              <div className="font-sans text-2xl font-medium text-charcoal">Inter</div>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Crisp, highly legible neutral sans-serif designed for microcopy, data tables, expenditure reports, and touch-target labels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap & Architecture Section */}
      <section id="roadmap" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-ivory-border pt-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-orange-muted block mb-2">Development Roadmap</span>
              <h2 className="text-3xl font-serif font-bold text-forest">Implementation Modules</h2>
            </div>
            <p className="text-xs text-charcoal-muted max-w-md">
              Each module will be built cleanly and incrementally. Per strict scope restrictions, subsequent features will be enabled module by module.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {modules.map((m) => (
              <div 
                key={m.id}
                className={`p-5 rounded-xl border transition-all ${
                  m.current
                    ? 'bg-white border-forest shadow-warm ring-1 ring-forest/20'
                    : 'bg-white/60 border-ivory-border opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-ivory-warm text-charcoal-muted">
                    Module {m.id}
                  </span>
                  {m.current ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Ready
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-charcoal-muted">
                      <Clock className="w-3 h-3" /> Queued
                    </span>
                  )}
                </div>
                <div className="font-serif font-semibold text-charcoal text-base">
                  {m.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
