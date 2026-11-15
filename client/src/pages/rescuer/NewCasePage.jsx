import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Upload,
  X,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';
import { createRescueCase } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Container from '../../components/layout/Container';
import Section from '../../components/layout/Section';
import BaseCard from '../../components/cards/BaseCard';
import FormInput from '../../components/forms/FormInput';
import FormTextarea from '../../components/forms/FormTextarea';
import FormSelect from '../../components/forms/FormSelect';
import FormLabel from '../../components/forms/FormLabel';
import PrimaryButton from '../../components/common/PrimaryButton';
import OutlineButton from '../../components/common/OutlineButton';

export const NewCasePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  // Guard: unverified rescuers cannot submit live cases
  const isApproved = user?.role === 'admin' || user?.rescuerVerificationStatus === 'approved';

  // Form State
  const [formData, setFormData] = useState({
    // Section A: Animal Information
    animalName: '',
    animalType: 'Dog',
    breed: 'Indie / Street Breed',
    age: '2 years approx',
    gender: 'Unknown',
    location: '',

    // Section B: Emergency Details
    title: '',
    injuryType: 'Fracture / Trauma',
    injuryDescription: '',
    medicalCondition: '',
    urgencyLevel: 'Urgent',

    // Section C: Campaign Details
    estimatedTreatmentCost: '',
    fundraisingGoal: '',
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    // Check maximum 5 files
    if (selectedFiles.length + files.length > 5) {
      setError('You can upload a maximum of 5 images per rescue case.');
      return;
    }

    // Validate size (max 5MB) and type
    const validFiles = [];
    const newPreviews = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`File "${file.name}" exceeds the 5MB maximum size limit.`);
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError(`File "${file.name}" is not a valid format. Please upload JPEG, PNG, or WebP.`);
        return;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setFilePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    if (!formData.title.trim()) return 'Please enter a case title.';
    if (!formData.animalName.trim()) return 'Please enter animal name or temporary identifier.';
    if (!formData.location.trim()) return 'Please specify the exact rescue location / landmark.';
    if (!formData.injuryDescription.trim()) return 'Please describe the injury / physical trauma in detail.';
    if (!formData.medicalCondition.trim()) return 'Please provide current medical condition / clinic diagnosis.';
    const cost = Number(formData.estimatedTreatmentCost);
    const goal = Number(formData.fundraisingGoal);
    if (isNaN(cost) || cost < 100) return 'Estimated treatment cost must be at least ₹100.';
    if (isNaN(goal) || goal < 100) return 'Fundraising goal must be at least ₹100.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setLoading(true);

      // Construct multipart form data
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      // Append description default if not provided
      const desc = `${formData.title}. ${formData.injuryDescription} Rescued at ${formData.location}. Current condition: ${formData.medicalCondition}.`;
      data.append('description', desc);

      // Append files
      selectedFiles.forEach((file) => {
        data.append('images', file);
      });

      // Default demo image fallback if no file uploaded
      if (selectedFiles.length === 0) {
        data.append('imageUrls[]', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80');
      }

      const res = await createRescueCase(data);

      setLoading(false);
      if (res && res.success) {
        setSuccess('Rescue case submitted successfully! It is now pending administrative verification.');
        setTimeout(() => {
          navigate('/rescuer/cases');
        }, 1500);
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to submit rescue case. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!isApproved) {
    return (
      <Section spacing="default">
        <Container size="narrow">
          <BaseCard padding="lg" className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                Rescuer Verification Pending
              </span>
              <h2 className="font-serif text-3xl font-bold text-forest">
                Case Publishing Restricted
              </h2>
              <p className="text-sm text-charcoal-muted leading-relaxed max-w-md mx-auto">
                Your rescuer account is awaiting administrative verification. To safeguard animal welfare and ensure all reported cases have legitimate veterinary backing, administrators must verify your account before you can submit live rescue cases.
              </p>
            </div>
            <div className="pt-2 flex justify-center">
              <Link to="/rescuer/dashboard">
                <PrimaryButton icon={ArrowLeft}>
                  Return to Rescuer Dashboard
                </PrimaryButton>
              </Link>
            </div>
          </BaseCard>
        </Container>
      </Section>
    );
  }

  return (
    <Section spacing="default" className="py-8 sm:py-12">
      <Container size="narrow">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/rescuer/cases"
            className="inline-flex items-center text-xs font-semibold text-charcoal-muted hover:text-forest transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to My Rescue Cases
          </Link>
        </div>

        <BaseCard padding="lg" className="bg-white space-y-8 shadow-warm-lg">
          {/* Header */}
          <div className="border-b border-grey-light pb-6 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-subtle text-forest text-xs font-semibold uppercase tracking-wider">
              <PlusCircle className="w-3.5 h-3.5" />
              Emergency Triage Submission
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
              Submit an Injured Stray Animal Case
            </h1>
            <p className="text-sm text-charcoal-muted font-sans leading-relaxed">
              Complete the medical report below. Once submitted, your case will be queued for admin verification before live community crowdfunding begins.
            </p>
          </div>

          {/* Error & Success Messages */}
          {error && (
            <div className="rounded-xl p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="rounded-xl p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-700" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            {/* Section A: Animal Information */}
            <div className="space-y-4">
              <h2 className="font-serif text-xl font-bold text-forest flex items-center gap-2 border-b border-grey-light/70 pb-2">
                <span className="w-6 h-6 rounded-full bg-forest text-ivory text-xs flex items-center justify-center font-sans font-bold">
                  A
                </span>
                Animal Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  id="animalName"
                  name="animalName"
                  label="Animal Name or Identifier"
                  placeholder="e.g. Bruno, White Pup, Stray Kitten"
                  value={formData.animalName}
                  onChange={handleChange}
                  required
                />

                <FormSelect
                  id="animalType"
                  name="animalType"
                  label="Animal Type"
                  value={formData.animalType}
                  onChange={handleChange}
                  required
                  options={[
                    { value: 'Dog', label: 'Dog' },
                    { value: 'Cat', label: 'Cat' },
                    { value: 'Other', label: 'Other Injured Stray' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormInput
                  id="breed"
                  name="breed"
                  label="Breed / Description"
                  placeholder="e.g. Indie street hound"
                  value={formData.breed}
                  onChange={handleChange}
                  optional
                />

                <FormInput
                  id="age"
                  name="age"
                  label="Estimated Age"
                  placeholder="e.g. 6 months, 3 years"
                  value={formData.age}
                  onChange={handleChange}
                  optional
                />

                <FormSelect
                  id="gender"
                  name="gender"
                  label="Gender"
                  value={formData.gender}
                  onChange={handleChange}
                  options={[
                    { value: 'Unknown', label: 'Unknown' },
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                  ]}
                />
              </div>

              <FormInput
                id="location"
                name="location"
                label="Rescue Location / Landmark"
                placeholder="e.g. Sector 14, Old Town Market near flyover pillar 12"
                value={formData.location}
                onChange={handleChange}
                required
                helperText="Be as specific as possible so nearby rescuers or volunteers can assist"
              />
            </div>

            {/* Section B: Emergency Details */}
            <div className="space-y-4">
              <h2 className="font-serif text-xl font-bold text-forest flex items-center gap-2 border-b border-grey-light/70 pb-2">
                <span className="w-6 h-6 rounded-full bg-forest text-ivory text-xs flex items-center justify-center font-sans font-bold">
                  B
                </span>
                Emergency & Clinical Details
              </h2>

              <FormInput
                id="title"
                name="title"
                label="Case Title (Public Heading)"
                placeholder="e.g. Bruno — Street Dog with Critical Pelvic Fracture"
                value={formData.title}
                onChange={handleChange}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  id="injuryType"
                  name="injuryType"
                  label="Injury Classification"
                  placeholder="e.g. Closed Tibia Fracture, Deep Laceration"
                  value={formData.injuryType}
                  onChange={handleChange}
                  required
                />

                <FormSelect
                  id="urgencyLevel"
                  name="urgencyLevel"
                  label="Urgency Severity"
                  value={formData.urgencyLevel}
                  onChange={handleChange}
                  required
                  options={[
                    { value: 'Critical', label: 'Critical — Life Threatening' },
                    { value: 'Urgent', label: 'Urgent — Immediate Care Required' },
                    { value: 'Normal', label: 'Normal — Stable, Needs Surgery/Meds' },
                  ]}
                />
              </div>

              <FormTextarea
                id="injuryDescription"
                name="injuryDescription"
                label="Physical Trauma Description"
                rows={3}
                placeholder="Describe how the animal was found, physical wounds, bleeding, non-weight bearing limbs, or trauma..."
                value={formData.injuryDescription}
                onChange={handleChange}
                required
              />

              <FormTextarea
                id="medicalCondition"
                name="medicalCondition"
                label="Current Medical Condition & Attending Clinic Action"
                rows={3}
                placeholder="Describe clinic diagnosis, IV fluids given, medication prescribed, or surgery scheduled..."
                value={formData.medicalCondition}
                onChange={handleChange}
                required
              />
            </div>

            {/* Section C: Campaign Details & Image Upload */}
            <div className="space-y-4">
              <h2 className="font-serif text-xl font-bold text-forest flex items-center gap-2 border-b border-grey-light/70 pb-2">
                <span className="w-6 h-6 rounded-full bg-forest text-ivory text-xs flex items-center justify-center font-sans font-bold">
                  C
                </span>
                Campaign Estimates & Animal Photographs
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  id="estimatedTreatmentCost"
                  name="estimatedTreatmentCost"
                  type="number"
                  label="Estimated Veterinary Cost (₹)"
                  placeholder="e.g. 12000"
                  value={formData.estimatedTreatmentCost}
                  onChange={handleChange}
                  required
                  helperText="Estimated surgery, inpatient boarding, and pharmacy total"
                />

                <FormInput
                  id="fundraisingGoal"
                  name="fundraisingGoal"
                  type="number"
                  label="Fundraising Goal (₹)"
                  placeholder="e.g. 12000"
                  value={formData.fundraisingGoal}
                  onChange={handleChange}
                  required
                  helperText="Simulated community fundraising target"
                />
              </div>

              {/* Image Upload Area */}
              <div className="space-y-2">
                <FormLabel optional>Animal Photographs (Up to 5 images, max 5MB each)</FormLabel>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-grey-light hover:border-forest/50 bg-ivory-warm/40 hover:bg-ivory-warm/70 rounded-2xl p-6 text-center cursor-pointer transition-all duration-150 space-y-2"
                >
                  <div className="w-12 h-12 mx-auto rounded-xl bg-forest-subtle text-forest flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-semibold text-charcoal">
                    Click to select animal photos from your device
                  </div>
                  <p className="text-[11px] text-charcoal-muted">
                    Supports JPEG, PNG, or WebP. Clinical injury photos help verify urgency.
                  </p>
                </div>

                {/* Previews Grid */}
                {filePreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3">
                    {filePreviews.map((previewUrl, idx) => (
                      <div
                        key={idx}
                        className="relative rounded-xl overflow-hidden border border-grey-light aspect-square group shadow-warm-sm"
                      >
                        <img
                          src={previewUrl}
                          alt={`Upload preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-charcoal/80 text-white hover:bg-rose-600 transition-colors"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section D: Confirmation & Submit */}
            <div className="pt-6 border-t border-grey-light space-y-4">
              <div className="p-4 rounded-xl bg-sage-wash/60 border border-sage/40 text-xs text-forest space-y-1">
                <strong className="block font-semibold">Triage Integrity Confirmation:</strong>
                <p className="leading-relaxed">
                  By submitting, you certify that this animal is in need of emergency medical treatment and you will provide stamped veterinary invoices upon request.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3">
                <Link to="/rescuer/cases">
                  <OutlineButton>Cancel</OutlineButton>
                </Link>
                <PrimaryButton
                  type="submit"
                  icon={ArrowRight}
                  iconPosition="right"
                  isLoading={loading}
                >
                  Submit for Admin Review
                </PrimaryButton>
              </div>
            </div>
          </form>
        </BaseCard>
      </Container>
    </Section>
  );
};

export default NewCasePage;
