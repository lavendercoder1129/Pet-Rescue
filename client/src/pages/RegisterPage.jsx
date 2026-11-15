import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  Heart,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Container from '../components/layout/Container';
import Section from '../components/layout/Section';
import BaseCard from '../components/cards/BaseCard';
import FormInput from '../components/forms/FormInput';
import FormLabel from '../components/forms/FormLabel';
import PrimaryButton from '../components/common/PrimaryButton';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'donor', // 'donor' or 'rescuer'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (isAuthenticated && user) {
    navigate(`/${user.role}/dashboard`, { replace: true });
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formError) setFormError('');
  };

  const handleRoleSelect = (selectedRole) => {
    // Extra safety: never allow selection of 'admin'
    if (selectedRole === 'admin') return;
    setFormData((prev) => ({ ...prev, role: selectedRole }));
  };

  const validate = () => {
    if (!formData.name.trim()) return 'Please enter your full name.';
    if (!formData.email.trim()) return 'Please enter your email address.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim()))
      return 'Please provide a valid email format.';
    if (!formData.password) return 'Please enter a password.';
    if (formData.password.length < 8)
      return 'Password must be at least 8 characters long.';
    if (
      !/[a-zA-Z]/.test(formData.password) ||
      !/[0-9]/.test(formData.password)
    ) {
      return 'Password must contain at least one letter and one number.';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    const error = validate();
    if (error) {
      setFormError(error);
      return;
    }

    setLoading(true);
    const result = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      role: formData.role,
    });
    setLoading(false);

    if (result.success) {
      setSuccessMessage(result.message);
      setTimeout(() => {
        navigate(`/${result.user.role}/dashboard`, { replace: true });
      }, 1200);
    } else {
      setFormError(result.message || 'Registration failed.');
    }
  };

  return (
    <Section spacing="default" className="py-12 sm:py-20">
      <Container size="narrow">
        <BaseCard padding="lg" className="bg-white space-y-8 shadow-warm-lg">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-forest flex items-center justify-center text-ivory shadow-warm-sm">
              <UserPlus className="w-6 h-6 text-sage-light" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
              Join Pet Rescue
            </h1>
            <p className="text-sm text-charcoal-muted font-sans max-w-sm mx-auto">
              Choose your role and become an active guardian for injured stray animals.
            </p>
          </div>

          {/* Form Error or Success Banner */}
          {formError && (
            <div className="rounded-xl p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-700" />
              <span>{successMessage} Redirecting to your dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Account Type Selector (Donor vs Rescuer) */}
            <div className="space-y-2">
              <FormLabel>I am joining as a:</FormLabel>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('donor')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    formData.role === 'donor'
                      ? 'border-forest bg-sage-wash/60 ring-2 ring-forest/20 shadow-warm-sm'
                      : 'border-grey-light hover:border-sage bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-serif font-bold text-forest text-base flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-orange-muted fill-orange-muted" />
                      Donor
                    </span>
                    {formData.role === 'donor' && (
                      <span className="w-2 h-2 rounded-full bg-forest" />
                    )}
                  </div>
                  <p className="text-xs text-charcoal-muted leading-relaxed">
                    Support verified rescue campaigns and track simulated fund allocation.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('rescuer')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    formData.role === 'rescuer'
                      ? 'border-forest bg-sage-wash/60 ring-2 ring-forest/20 shadow-warm-sm'
                      : 'border-grey-light hover:border-sage bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-serif font-bold text-forest text-base flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-forest" />
                      Rescuer
                    </span>
                    {formData.role === 'rescuer' && (
                      <span className="w-2 h-2 rounded-full bg-forest" />
                    )}
                  </div>
                  <p className="text-xs text-charcoal-muted leading-relaxed">
                    Report emergency injured strays. Requires pending admin verification.
                  </p>
                </button>
              </div>

              {formData.role === 'rescuer' && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-snug">
                  * Rescuer accounts start with <strong>Pending Verification</strong> status. You can access your rescuer dashboard, but case publishing requires administrative validation.
                </div>
              )}
            </div>

            {/* Input Fields */}
            <div className="space-y-4">
              <FormInput
                id="regName"
                name="name"
                label="Full Name"
                placeholder="e.g. Ananya Sharma"
                value={formData.name}
                onChange={handleChange}
                icon={User}
                required
                autoComplete="name"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  id="regEmail"
                  name="email"
                  type="email"
                  label="Email Address"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  icon={Mail}
                  required
                  autoComplete="email"
                />

                <FormInput
                  id="regPhone"
                  name="phone"
                  type="tel"
                  label="Phone Number"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  icon={Phone}
                  optional
                  autoComplete="tel"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <FormInput
                    id="regPassword"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    placeholder="Min 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    icon={Lock}
                    required
                    helperText="At least 1 letter and 1 number"
                    inputClassName="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-9 text-charcoal-muted hover:text-forest focus-visible:outline-none"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <FormInput
                  id="regConfirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  label="Confirm Password"
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  icon={Lock}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <PrimaryButton
                type="submit"
                size="lg"
                className="w-full"
                icon={UserPlus}
                isLoading={loading}
              >
                Create {formData.role === 'rescuer' ? 'Rescuer' : 'Donor'} Account
              </PrimaryButton>
            </div>
          </form>

          {/* Switch to Login */}
          <div className="pt-4 border-t border-grey-light text-center text-xs text-charcoal-muted">
            <span>Already have an account? </span>
            <Link
              to="/login"
              className="font-semibold text-forest hover:text-forest-light underline"
            >
              Sign In to Your Account
            </Link>
          </div>
        </BaseCard>
      </Container>
    </Section>
  );
};

export default RegisterPage;
