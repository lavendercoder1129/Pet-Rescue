import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, HeartHandshake } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Container from '../components/layout/Container';
import Section from '../components/layout/Section';
import BaseCard from '../components/cards/BaseCard';
import FormInput from '../components/forms/FormInput';
import PrimaryButton from '../components/common/PrimaryButton';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // If already authenticated, redirect to appropriate role dashboard
  if (isAuthenticated && user) {
    const redirectPath = location.state?.from?.pathname || `/${user.role}/dashboard`;
    navigate(redirectPath, { replace: true });
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (formError) setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.email.trim()) {
      setFormError('Please enter your email address.');
      return;
    }
    if (!formData.password) {
      setFormError('Please enter your password.');
      return;
    }

    setLoading(true);
    const result = await login({
      email: formData.email,
      password: formData.password,
    });
    setLoading(false);

    if (result.success) {
      const redirectPath =
        location.state?.from?.pathname || `/${result.user.role}/dashboard`;
      navigate(redirectPath, { replace: true });
    } else {
      setFormError(result.message || 'Invalid email or password.');
    }
  };

  return (
    <Section spacing="default" className="py-12 sm:py-20">
      <Container size="narrow">
        <BaseCard padding="lg" className="bg-white space-y-8 shadow-warm-lg">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-forest flex items-center justify-center text-ivory shadow-warm-sm">
              <HeartHandshake className="w-6 h-6 text-sage-light" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
              Welcome Back
            </h1>
            <p className="text-sm text-charcoal-muted font-sans">
              Sign in to manage rescue cases, track contributions, or verify clinical proofs.
            </p>
          </div>

          {/* Form Error Banner */}
          {formError && (
            <div className="rounded-xl p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <FormInput
              id="loginEmail"
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

            <div className="relative">
              <FormInput
                id="loginPassword"
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                icon={Lock}
                required
                autoComplete="current-password"
                inputClassName="pr-12"
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

            {/* Remember Me Option */}
            <div className="flex items-center justify-between text-xs text-charcoal-muted pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="rounded border-grey-light text-forest focus:ring-forest"
                />
                <span>Remember me on this browser</span>
              </label>

              <span className="text-[11px] text-charcoal-muted/70">
                Stateless JWT Security
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <PrimaryButton
                type="submit"
                size="lg"
                className="w-full"
                icon={LogIn}
                isLoading={loading}
              >
                Sign In to Account
              </PrimaryButton>
            </div>
          </form>

          {/* Switch to Register */}
          <div className="pt-4 border-t border-grey-light text-center text-xs text-charcoal-muted">
            <span>Do not have an account yet? </span>
            <Link
              to="/register"
              className="font-semibold text-forest hover:text-forest-light underline"
            >
              Register as Donor or Rescuer
            </Link>
          </div>
        </BaseCard>
      </Container>
    </Section>
  );
};

export default LoginPage;
