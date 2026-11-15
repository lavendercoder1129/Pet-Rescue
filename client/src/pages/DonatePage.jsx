import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Lock,
  CheckCircle2,
  Info,
  Sparkles,
  User,
} from 'lucide-react';
import { getPublicCaseById, createDonation } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Container from '../components/layout/Container';
import Section from '../components/layout/Section';
import BaseCard from '../components/cards/BaseCard';
import PrimaryButton from '../components/common/PrimaryButton';
import OutlineButton from '../components/common/OutlineButton';
import FormInput from '../components/forms/FormInput';
import FormTextarea from '../components/forms/FormTextarea';
import ProgressBar from '../components/feedback/ProgressBar';
import UrgencyBadge from '../components/feedback/UrgencyBadge';
import LoadingState from '../components/feedback/LoadingState';
import EmptyState from '../components/feedback/EmptyState';

const SUGGESTED_AMOUNTS = [100, 250, 500, 1000];

export const DonatePage = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [rescueCase, setRescueCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Donation form state
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [donationMessage, setDonationMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [amountError, setAmountError] = useState('');

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Generate an idempotency key per intent
  const [idempotencyKey] = useState(() => `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPublicCaseById(caseId);
        if (data && data.success && data.case) {
          setRescueCase(data.case);
        } else {
          setError('Rescue campaign could not be loaded.');
        }
      } catch (err) {
        setError(err.message || 'Campaign unavailable or pending admin verification.');
      } finally {
        setLoading(false);
      }
    };

    if (caseId) {
      fetchCase();
    }
  }, [caseId]);

  const effectiveAmount = isCustom ? Number(customAmount) : Number(selectedAmount);

  const handleAmountSelect = (amt) => {
    setIsCustom(false);
    setSelectedAmount(amt);
    setCustomAmount('');
    setAmountError('');
  };

  const handleCustomChange = (e) => {
    setIsCustom(true);
    setCustomAmount(e.target.value);
    const val = Number(e.target.value);
    if (!e.target.value) {
      setAmountError('Please enter a custom amount.');
    } else if (isNaN(val) || val < 10) {
      setAmountError('Minimum simulated donation is ₹10.');
    } else if (val > 500000) {
      setAmountError('Maximum simulated donation is ₹500,000.');
    } else {
      setAmountError('');
    }
  };

  const handleProceedToConfirm = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      // Preserve intended donation path
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (!effectiveAmount || isNaN(effectiveAmount) || effectiveAmount < 10) {
      setAmountError('Simulated donation must be at least ₹10.');
      return;
    }
    if (effectiveAmount > 500000) {
      setAmountError('Simulated donation cannot exceed ₹500,000.');
      return;
    }

    setSubmitError('');
    setShowConfirmModal(true);
  };

  const handleConfirmDonation = async () => {
    try {
      setSubmitting(true);
      setSubmitError('');

      const payload = {
        caseId: rescueCase._id,
        amount: effectiveAmount,
        donationMessage,
        isAnonymous,
        idempotencyKey,
      };

      const res = await createDonation(payload);
      setSubmitting(false);

      if (res && res.success && res.donation) {
        setShowConfirmModal(false);
        // Navigate to the success receipt page
        navigate(`/donation/success/${res.donation._id}`, {
          state: { donation: res.donation },
        });
      }
    } catch (err) {
      setSubmitting(false);
      setSubmitError(err.message || 'Failed to record simulated donation.');
    }
  };

  if (loading) {
    return (
      <Section spacing="default" className="py-20">
        <Container size="narrow">
          <LoadingState
            message="Preparing simulated donation checkout..."
            subtext="Loading verified clinical campaign estimates"
          />
        </Container>
      </Section>
    );
  }

  if (error || !rescueCase) {
    return (
      <Section spacing="default" className="py-20">
        <Container size="narrow">
          <EmptyState
            icon={AlertCircle}
            title="Campaign Unavailable for Contributions"
            description={error || 'This rescue case is not currently approved or active for crowdfunding.'}
            action={
              <Link to="/cases">
                <PrimaryButton icon={ArrowLeft}>
                  Explore Active Rescue Directory
                </PrimaryButton>
              </Link>
            }
          />
        </Container>
      </Section>
    );
  }

  const primaryImage =
    rescueCase.images && rescueCase.images.length > 0
      ? rescueCase.images[0].startsWith('http')
        ? rescueCase.images[0]
        : `http://localhost:5000${rescueCase.images[0]}`
      : 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80';

  const collected = rescueCase.amountCollected || 0;
  const goal = rescueCase.fundraisingGoal || 1;
  const remaining = Math.max(0, goal - collected);
  const percentage = Math.min(100, Math.round((collected / goal) * 100));

  return (
    <Section spacing="default" className="py-8 sm:py-12">
      <Container size="default">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            to={`/cases/${rescueCase._id}`}
            className="inline-flex items-center text-xs font-semibold text-charcoal-muted hover:text-forest transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Case Details
          </Link>
        </div>

        {/* Global Academic Simulation Banner */}
        <div className="rounded-2xl p-4 sm:p-5 mb-8 bg-amber-50/90 border border-amber-200/90 shadow-warm-xs flex items-start gap-3.5 text-xs text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-800 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-semibold block text-sm text-amber-950 font-serif">
              Academic Demonstration Notice — No Real Money Transferred
            </strong>
            <p className="leading-relaxed">
              This is an academic demonstration. No real payment will be processed, and no money will be transferred.
              No credit card, UPI, bank details, or live financial credentials will ever be requested.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Campaign Summary */}
          <div className="lg:col-span-5 space-y-6">
            <BaseCard padding="lg" className="space-y-5 bg-white shadow-warm border border-grey-light">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted block">
                Supporting Rescue Campaign
              </span>

              {/* Photo & Urgency */}
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-ivory-warm border border-grey-light">
                <img
                  src={primaryImage}
                  alt={rescueCase.animalName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <UrgencyBadge level={rescueCase.urgencyLevel.toLowerCase()} />
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-charcoal">
                  {rescueCase.animalType}
                </div>
              </div>

              <div>
                <h2 className="font-serif text-2xl font-bold text-forest">
                  {rescueCase.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-charcoal-muted mt-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sage-dark flex-shrink-0" />
                  <span>{rescueCase.location}</span>
                </div>
              </div>

              {/* Progress & Target Stats */}
              <div className="pt-3 border-t border-grey-light space-y-3">
                <div className="flex items-baseline justify-between text-xs">
                  <div>
                    <span className="font-serif text-2xl font-bold text-forest">
                      ₹{collected.toLocaleString()}
                    </span>
                    <span className="text-charcoal-muted ml-1">simulated raised</span>
                  </div>
                  <span className="font-semibold text-forest">{percentage}%</span>
                </div>

                <ProgressBar
                  value={collected}
                  max={goal}
                  variant={percentage >= 100 ? 'emerald' : 'orange'}
                  size="sm"
                />

                <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-charcoal-muted font-sans">
                  <div className="p-2.5 rounded-xl bg-ivory-warm/60 border border-grey-light/60">
                    <span className="text-[10px] uppercase font-semibold text-charcoal-muted block">
                      Fundraising Goal
                    </span>
                    <strong className="text-forest text-sm">₹{goal.toLocaleString()}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-ivory-warm/60 border border-grey-light/60">
                    <span className="text-[10px] uppercase font-semibold text-charcoal-muted block">
                      Remaining Target
                    </span>
                    <strong className="text-charcoal text-sm">₹{remaining.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-sage-wash/60 border border-sage/40 text-[11px] text-forest flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
                <span>
                  100% of simulated contributions are held in virtual escrow for verified clinical veterinary treatment.
                </span>
              </div>
            </BaseCard>
          </div>

          {/* Right Column: Donation Form */}
          <div className="lg:col-span-7">
            <BaseCard padding="lg" className="space-y-6 bg-white shadow-warm border border-grey-light">
              <div className="border-b border-grey-light pb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-orange-muted font-sans">
                  Simulated Contribution
                </span>
                <h1 className="font-serif text-3xl font-bold text-forest mt-1">
                  Choose Donation Amount
                </h1>
                <p className="text-xs text-charcoal-muted mt-1 font-sans">
                  Select a suggested pledge or enter a custom amount to support {rescueCase.animalName}'s emergency treatment.
                </p>
              </div>

              <form onSubmit={handleProceedToConfirm} className="space-y-6 font-sans">
                {/* Suggested Amounts Grid */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal">
                    Suggested Pledge Amounts (INR)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {SUGGESTED_AMOUNTS.map((amt) => {
                      const isSelected = !isCustom && selectedAmount === amt;
                      return (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleAmountSelect(amt)}
                          className={`py-3 px-4 rounded-xl font-serif text-lg font-bold transition-all ${
                            isSelected
                              ? 'bg-forest text-ivory ring-2 ring-forest shadow-warm-sm scale-[1.02]'
                              : 'bg-ivory-warm/70 text-forest border border-grey-light hover:border-forest hover:bg-ivory-warm'
                          }`}
                        >
                          ₹{amt.toLocaleString()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Amount Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-charcoal">
                    Or Enter Custom Amount (₹10 – ₹500,000)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-sm font-bold text-charcoal-muted">
                      ₹
                    </span>
                    <FormInput
                      type="number"
                      min="10"
                      max="500000"
                      placeholder="e.g. 1500"
                      value={customAmount}
                      onChange={handleCustomChange}
                      className="pl-8 text-sm font-semibold"
                    />
                  </div>
                  {amountError && (
                    <p className="text-xs text-rose-700 font-medium">{amountError}</p>
                  )}
                </div>

                {/* Donor Details & Anonymous Preferences */}
                <div className="p-4 rounded-2xl bg-ivory-warm/60 border border-grey-light space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-charcoal block">
                      Donor Identity
                    </span>
                    {isAuthenticated ? (
                      <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Logged in as {user?.name}
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-800 font-medium">
                        Authentication Required
                      </span>
                    )}
                  </div>

                  {isAuthenticated ? (
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between text-charcoal-muted">
                        <span>Email address for receipt:</span>
                        <strong className="text-charcoal font-mono">{user?.email}</strong>
                      </div>

                      {/* Anonymity Toggle */}
                      <label className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-grey-light/60">
                        <input
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="mt-0.5 rounded text-forest focus:ring-forest w-4 h-4"
                        />
                        <div className="text-xs text-charcoal">
                          <span className="font-semibold block">Keep my donation anonymous</span>
                          <span className="text-[11px] text-charcoal-muted">
                            Your name will not appear on public donor rolls or campaign receipts.
                          </span>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="text-xs text-charcoal-muted space-y-2">
                      <p>
                        Please sign in or register to record your simulated donation and receive a simulated receipt in your dashboard.
                      </p>
                      <Link to="/login" state={{ from: location.pathname }}>
                        <OutlineButton size="sm" icon={User}>
                          Log In to Continue
                        </OutlineButton>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Optional Donation Message */}
                <div className="space-y-1.5">
                  <FormTextarea
                    label="Optional Words of Support for Rescuer / Animal"
                    placeholder="e.g. Wishing Rocky a swift orthopedic recovery!"
                    rows={2}
                    value={donationMessage}
                    onChange={(e) => setDonationMessage(e.target.value)}
                    helperText="Max 500 characters. Visible on campaign updates."
                  />
                </div>

                {/* Submission CTA */}
                <div className="pt-2 space-y-3">
                  <PrimaryButton
                    type="submit"
                    size="lg"
                    icon={Heart}
                    disabled={Boolean(amountError) || !effectiveAmount}
                    className="w-full bg-orange-muted hover:bg-orange-hover text-white font-serif text-lg py-3.5 shadow-warm"
                  >
                    {isAuthenticated
                      ? `Complete Simulated Donation (₹${(effectiveAmount || 0).toLocaleString()})`
                      : 'Sign In to Complete Simulated Donation'}
                  </PrimaryButton>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-charcoal-muted text-center">
                    <Lock className="w-3.5 h-3.5 text-sage-dark" />
                    <span>
                      100% Simulated Academic Environment • No Payment Gateway Connected
                    </span>
                  </div>
                </div>
              </form>
            </BaseCard>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-warm-lg border border-grey-light space-y-5 font-sans animate-fade-in">
              <div className="flex items-center gap-3 text-forest">
                <div className="w-12 h-12 rounded-2xl bg-forest/10 flex items-center justify-center text-forest">
                  <Heart className="w-6 h-6 fill-forest" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-orange-muted font-sans block">
                    Confirm Action
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-forest">
                    Review Simulated Pledge
                  </h3>
                </div>
              </div>

              {/* Order breakdown */}
              <div className="p-4 rounded-2xl bg-ivory-warm/70 border border-grey-light text-xs space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Rescue Campaign:</span>
                  <strong className="text-forest text-right max-w-[200px] truncate">
                    {rescueCase.title}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Patient Animal:</span>
                  <strong className="text-charcoal">{rescueCase.animalName} ({rescueCase.animalType})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Donor Name:</span>
                  <strong className="text-charcoal">
                    {isAnonymous ? 'Anonymous Supporter' : user?.name}
                  </strong>
                </div>
                {donationMessage && (
                  <div className="pt-2 border-t border-grey-light/60">
                    <span className="text-charcoal-muted block text-[11px]">Message:</span>
                    <span className="text-charcoal italic">"{donationMessage}"</span>
                  </div>
                )}
                <div className="pt-2 border-t border-grey-light/60 flex justify-between items-baseline">
                  <span className="font-semibold text-charcoal">Total Simulated Amount:</span>
                  <strong className="font-serif text-2xl font-bold text-forest">
                    ₹{effectiveAmount.toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* Simulation Disclosure */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-800 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  <strong>Simulation Disclosure:</strong> This is an academic demonstration. No real payment will be processed, and no money will be transferred.
                </p>
              </div>

              {submitError && (
                <p className="text-xs text-rose-700 font-semibold">{submitError}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <OutlineButton
                  size="md"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </OutlineButton>
                <PrimaryButton
                  size="md"
                  className="bg-forest hover:bg-forest-light text-white"
                  isLoading={submitting}
                  onClick={handleConfirmDonation}
                >
                  Confirm Simulated Donation
                </PrimaryButton>
              </div>
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
};

export default DonatePage;
