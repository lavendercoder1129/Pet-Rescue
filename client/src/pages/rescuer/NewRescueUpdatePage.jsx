import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  AlertCircle,
  X,
  FileCheck,
  Sparkles,
  Info,
} from 'lucide-react';
import { getMyEligibleCases, submitRescueUpdate } from '../../services/api';
import Container from '../../components/layout/Container';
import Section from '../../components/layout/Section';
import BaseCard from '../../components/cards/BaseCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import OutlineButton from '../../components/common/OutlineButton';
import FormInput from '../../components/forms/FormInput';
import FormTextarea from '../../components/forms/FormTextarea';
import LoadingState from '../../components/feedback/LoadingState';

const MILESTONES = [
  { value: 'rescued', label: 'Rescued & Secured' },
  { value: 'veterinary examination', label: 'Veterinary Examination & Diagnosis' },
  { value: 'treatment', label: 'Treatment & Medical Procedure' },
  { value: 'recovering', label: 'In Recovery / Post-Op Care' },
  { value: 'recovered', label: 'Fully Recovered' },
  { value: 'released', label: 'Released to Habitat / Foster Care' },
  { value: 'other', label: 'Other General Update' },
];

export const NewRescueUpdatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCaseId = searchParams.get('caseId') || '';

  const [cases, setCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const [selectedCaseId, setSelectedCaseId] = useState(preselectedCaseId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [milestone, setMilestone] = useState('treatment');
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoadingCases(true);
        const data = await getMyEligibleCases();
        if (data && data.success) {
          setCases(data.cases || []);
          if (preselectedCaseId && data.cases.some((c) => c._id === preselectedCaseId)) {
            setSelectedCaseId(preselectedCaseId);
          } else if (data.cases.length > 0 && !selectedCaseId) {
            setSelectedCaseId(data.cases[0]._id);
          }
        }
      } catch (err) {
        setErrorMessage(err.message || 'Failed to load eligible rescue cases.');
      } finally {
        setLoadingCases(false);
      }
    };
    fetchCases();
  }, [preselectedCaseId]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length + files.length > 5) {
      alert('You can upload a maximum of 5 images per rescue update.');
      return;
    }

    const newFiles = [...files, ...selected];
    setFiles(newFiles);

    const newPreviews = selected.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setFilePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCaseId) {
      setErrorMessage('Please select a rescue case.');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('Please provide an update title.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Please provide a detailed progress report description.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');

      const formData = new FormData();
      formData.append('caseId', selectedCaseId);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('milestone', milestone);

      files.forEach((file) => {
        formData.append('images', file);
      });

      const res = await submitRescueUpdate(formData);
      setSubmitting(false);

      if (res && res.success) {
        navigate('/rescuer/updates/history');
      }
    } catch (err) {
      setSubmitting(false);
      setErrorMessage(err.message || 'Failed to submit rescue update.');
    }
  };

  const selectedCaseData = cases.find((c) => c._id === selectedCaseId);

  return (
    <Section spacing="default" className="py-8 sm:py-12">
      <Container size="default">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between font-sans">
          <Link
            to="/rescuer/updates"
            className="inline-flex items-center text-xs font-semibold text-charcoal-muted hover:text-forest transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to My Cases
          </Link>
          <span className="text-xs font-mono text-charcoal-muted">Rescuer Intake Portal</span>
        </div>

        {/* Global Review Notice */}
        <div className="rounded-2xl p-4 mb-8 bg-sage/20 border border-sage text-xs text-forest flex items-start gap-3 shadow-warm-xs font-sans">
          <Info className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="block text-sm font-serif font-bold text-forest">
              Administrative Moderation Workflow
            </strong>
            <p className="leading-relaxed text-[11px] text-charcoal">
              Your update will be reviewed by an administrator before it becomes publicly visible on the case timeline.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
          {/* Main Form */}
          <div className="lg:col-span-8">
            <BaseCard padding="lg" className="space-y-6 bg-white shadow-warm border border-grey-light">
              <div className="border-b border-grey-light pb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-forest font-sans">
                  Clinical Progress Report
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest mt-1">
                  Post Progress & Milestone Update
                </h1>
                <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                  Share veterinary examinations, surgical progress, medication updates, and photo evidence with the donor community.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {loadingCases ? (
                <LoadingState message="Loading eligible rescue cases..." />
              ) : cases.length === 0 ? (
                <div className="py-8 text-center text-xs text-charcoal-muted">
                  No eligible approved cases found. You must have an approved case to submit progress updates.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Case Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-charcoal">
                      Select Approved Rescue Case <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={selectedCaseId}
                      onChange={(e) => setSelectedCaseId(e.target.value)}
                      className="w-full text-xs rounded-xl border border-grey-light bg-ivory-warm/40 px-3.5 py-2.5 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest transition-colors"
                      required
                    >
                      {cases.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.animalName} ({c.animalType}) — {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Milestone Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-charcoal">
                      Recovery Stage Milestone <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={milestone}
                      onChange={(e) => setMilestone(e.target.value)}
                      className="w-full text-xs rounded-xl border border-grey-light bg-ivory-warm/40 px-3.5 py-2.5 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest transition-colors"
                      required
                    >
                      {MILESTONES.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Update Title */}
                  <FormInput
                    label="Milestone Title"
                    required
                    placeholder="e.g. Day 4 Post-Surgery: Splint Clean and Walking Successfully"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={140}
                  />

                  {/* Progress Description */}
                  <FormTextarea
                    label="Clinical Progress & Behavioral Report"
                    required
                    rows={5}
                    placeholder="Describe veterinary findings, healing milestones, dietary improvements, therapy sessions, or ongoing clinical treatments..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={3000}
                  />

                  {/* Image Upload Area */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-charcoal">
                      Recovery Photographs (Up to 5 images)
                    </label>
                    <div className="border-2 border-dashed border-grey-light hover:border-forest/50 rounded-2xl p-6 text-center bg-ivory-warm/30 transition-colors cursor-pointer">
                      <input
                        type="file"
                        id="update-images"
                        multiple
                        accept=".jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={files.length >= 5}
                      />
                      <label htmlFor="update-images" className="cursor-pointer block space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-forest" />
                        <div className="text-xs text-charcoal">
                          <span className="font-semibold text-forest underline">Click to upload</span> or drag and drop
                        </div>
                        <p className="text-[11px] text-charcoal-muted">
                          JPEG, PNG, or WebP (max 5MB each, up to 5 files total)
                        </p>
                      </label>
                    </div>

                    {/* Previews */}
                    {filePreviews.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        {filePreviews.map((p, idx) => (
                          <div
                            key={idx}
                            className="relative group rounded-xl overflow-hidden border border-grey-light aspect-square bg-ivory-warm"
                          >
                            <img
                              src={p.url}
                              alt={`preview-${idx}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(idx)}
                              className="absolute top-1.5 right-1.5 p-1 bg-charcoal/70 hover:bg-rose-700 text-white rounded-full transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <span className="absolute bottom-1 left-1 right-1 px-1.5 py-0.5 bg-charcoal/60 text-[10px] text-white truncate rounded">
                              {p.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Actions */}
                  <div className="pt-4 border-t border-grey-light flex items-center justify-end gap-3">
                    <Link to="/rescuer/updates">
                      <OutlineButton size="sm" type="button">
                        Cancel
                      </OutlineButton>
                    </Link>
                    <PrimaryButton
                      size="sm"
                      type="submit"
                      disabled={submitting}
                      icon={Sparkles}
                    >
                      {submitting ? 'Submitting...' : 'Submit Update for Moderation'}
                    </PrimaryButton>
                  </div>
                </form>
              )}
            </BaseCard>
          </div>

          {/* Sidebar / Case Details Summary */}
          <div className="lg:col-span-4 space-y-6">
            <BaseCard padding="md" className="space-y-4 bg-white shadow-warm border border-grey-light">
              <h3 className="font-serif text-lg font-bold text-forest">
                Selected Case Context
              </h3>
              {selectedCaseData ? (
                <div className="space-y-3 text-xs">
                  <div className="w-full h-36 rounded-xl overflow-hidden bg-ivory-warm border border-grey-light">
                    <img
                      src={
                        selectedCaseData.images && selectedCaseData.images.length > 0
                          ? selectedCaseData.images[0].startsWith('http')
                            ? selectedCaseData.images[0]
                            : `http://localhost:5000${selectedCaseData.images[0]}`
                          : 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={selectedCaseData.animalName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <strong className="text-sm font-serif block text-forest">
                      {selectedCaseData.animalName}
                    </strong>
                    <p className="text-charcoal-muted text-[11px] truncate">
                      {selectedCaseData.title}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-ivory-warm/60 border border-grey-light space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-charcoal-muted">Location:</span>
                      <span className="font-medium text-charcoal">{selectedCaseData.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-muted">Urgency:</span>
                      <span className="capitalize font-semibold text-forest">
                        {selectedCaseData.urgencyLevel}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-muted">Published Logs:</span>
                      <span className="font-semibold text-sage-dark">
                        {selectedCaseData.publishedUpdatesCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-charcoal-muted">
                  Select a rescue case to inspect details.
                </p>
              )}
            </BaseCard>

            <BaseCard padding="md" className="space-y-3 bg-ivory-warm/50 border border-grey-light">
              <h4 className="font-serif font-bold text-sm text-forest">
                Milestone Best Practices
              </h4>
              <ul className="text-xs text-charcoal-muted space-y-2 list-disc pl-4">
                <li>Include crisp, well-lit photos showing healing or recovery.</li>
                <li>Cite veterinarian remarks or surgery discharge notes.</li>
                <li>Mark "Fully Recovered" or "Released" when patient completes discharge.</li>
              </ul>
            </BaseCard>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default NewRescueUpdatePage;
