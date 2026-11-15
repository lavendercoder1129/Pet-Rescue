import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  CheckCircle2,
  Heart,
  ArrowRight,
  Printer,
  History,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Share2,
} from 'lucide-react';
import { getDonationById } from '../../services/api';
import Container from '../../components/layout/Container';
import Section from '../../components/layout/Section';
import BaseCard from '../../components/cards/BaseCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import OutlineButton from '../../components/common/OutlineButton';
import LoadingState from '../../components/feedback/LoadingState';
import EmptyState from '../../components/feedback/EmptyState';

export const DonationReceiptPage = () => {
  const { donationId } = useParams();
  const location = useLocation();

  // If passed from DonatePage, use state initially
  const [donation, setDonation] = useState(location.state?.donation || null);
  const [loading, setLoading] = useState(!location.state?.donation);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDonationById(donationId);
        if (data && data.success && data.donation) {
          setDonation(data.donation);
        } else {
          setError('Receipt not found.');
        }
      } catch (err) {
        setError(err.message || 'Unable to retrieve simulated donation receipt.');
      } finally {
        setLoading(false);
      }
    };

    if (!donation) {
      fetchDonation();
    }
  }, [donationId, donation]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Section spacing="default" className="py-20">
        <Container size="narrow">
          <LoadingState
            message="Generating simulated donation receipt..."
            subtext="Loading verified transaction record from database"
          />
        </Container>
      </Section>
    );
  }

  if (error || !donation) {
    return (
      <Section spacing="default" className="py-20">
        <Container size="narrow">
          <EmptyState
            icon={AlertCircle}
            title="Receipt Record Unavailable"
            description={error || 'The requested donation receipt could not be found or you do not have permission to view it.'}
            action={
              <Link to="/donor/donations">
                <PrimaryButton icon={History}>
                  View My Donation History
                </PrimaryButton>
              </Link>
            }
          />
        </Container>
      </Section>
    );
  }

  const donorName = donation.isAnonymous
    ? 'Anonymous Supporter'
    : donation.donor?.name || 'Supporter';

  return (
    <Section spacing="default" className="py-8 sm:py-16">
      <Container size="narrow">
        {/* Printable Receipt Card */}
        <div className="space-y-6">
          <BaseCard
            padding="lg"
            className="space-y-6 bg-white shadow-warm-lg border border-grey-light print:border-none print:shadow-none font-sans"
          >
            {/* Top Brand & Success Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-grey-light text-center sm:text-left">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 shadow-warm-xs">
                  <CheckCircle2 className="w-7 h-7 text-emerald-700" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 block">
                    Simulated Transaction Confirmed
                  </span>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest">
                    Pet Rescue Receipt
                  </h1>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-charcoal-muted uppercase block font-semibold">
                  Reference ID
                </span>
                <span className="font-mono text-xs font-bold text-forest bg-forest-subtle px-2.5 py-1 rounded-lg inline-block">
                  {donation.donationReference}
                </span>
              </div>
            </div>

            {/* Success Headline */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950 flex items-center gap-3">
              <Heart className="w-5 h-5 text-emerald-700 flex-shrink-0 fill-emerald-100" />
              <div>
                <strong>Your simulated donation was recorded successfully.</strong>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Thank you for supporting emergency animal rescue in this academic demonstration.
                </p>
              </div>
            </div>

            {/* Key Receipt Parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-ivory-warm/70 border border-grey-light/60">
                <span className="text-[10px] text-charcoal-muted uppercase font-semibold block">
                  Amount
                </span>
                <strong className="font-serif text-xl font-bold text-forest">
                  ₹{donation.amount.toLocaleString()}
                </strong>
                <span className="text-[10px] text-charcoal-muted block">INR (Simulated)</span>
              </div>

              <div className="p-3.5 rounded-xl bg-ivory-warm/70 border border-grey-light/60">
                <span className="text-[10px] text-charcoal-muted uppercase font-semibold block">
                  Status
                </span>
                <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 mt-1">
                  {donation.transactionStatus}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-ivory-warm/70 border border-grey-light/60">
                <span className="text-[10px] text-charcoal-muted uppercase font-semibold block">
                  Payment Method
                </span>
                <strong className="text-charcoal block mt-1 text-xs">
                  {donation.paymentMethod}
                </strong>
              </div>

              <div className="p-3.5 rounded-xl bg-ivory-warm/70 border border-grey-light/60">
                <span className="text-[10px] text-charcoal-muted uppercase font-semibold block">
                  Date & Time
                </span>
                <span className="text-charcoal text-[11px] block mt-1 font-mono">
                  {new Date(donation.createdAt).toLocaleDateString()}{' '}
                  {new Date(donation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Campaign & Donor Breakdown */}
            <div className="space-y-3 pt-2 border-t border-grey-light text-xs">
              <div className="flex justify-between py-1.5 border-b border-grey-light/60">
                <span className="text-charcoal-muted">Supported Rescue Campaign:</span>
                <strong className="text-forest text-right">
                  {donation.rescueCase?.title || 'Emergency Case'}
                </strong>
              </div>

              <div className="flex justify-between py-1.5 border-b border-grey-light/60">
                <span className="text-charcoal-muted">Patient Animal:</span>
                <span className="text-charcoal font-semibold">
                  {donation.rescueCase?.animalName} ({donation.rescueCase?.location})
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-grey-light/60">
                <span className="text-charcoal-muted">Donor Name:</span>
                <span className="text-charcoal font-semibold">{donorName}</span>
              </div>

              {donation.donationMessage && (
                <div className="py-2">
                  <span className="text-charcoal-muted block mb-1">Donor Message:</span>
                  <div className="p-3 rounded-xl bg-ivory-warm/40 border border-grey-light italic text-charcoal">
                    "{donation.donationMessage}"
                  </div>
                </div>
              )}
            </div>

            {/* Mandatory Academic Disclaimer */}
            <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-800 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="font-semibold block text-[11px] uppercase tracking-wider text-amber-900">
                  Simulation Receipt — Not a Financial or Tax Receipt
                </strong>
                <p className="leading-relaxed text-[11px]">
                  Simulation receipt — not a financial or tax receipt. No actual payment was made.
                  This record is generated for academic demonstration of crowdfunding workflows only.
                  It carries no legal monetary value and does not qualify for Section 80G tax deductions.
                </p>
              </div>
            </div>
          </BaseCard>

          {/* Action Navigation (Hidden in print) */}
          <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-3">
              <Link to="/donor/donations">
                <OutlineButton size="sm" icon={History}>
                  View Donation History
                </OutlineButton>
              </Link>

              {donation.rescueCase?._id && (
                <Link to={`/cases/${donation.rescueCase._id}`}>
                  <PrimaryButton size="sm" icon={ArrowRight} iconPosition="right">
                    View Campaign Progress
                  </PrimaryButton>
                </Link>
              )}
            </div>

            <OutlineButton size="sm" icon={Printer} onClick={handlePrint}>
              Print Receipt
            </OutlineButton>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default DonationReceiptPage;
