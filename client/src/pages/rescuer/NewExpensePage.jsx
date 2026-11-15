import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  Receipt,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  File,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { getMyCases, getAdminCaseFinancials, submitExpense } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Container from '../../components/layout/Container';
import Section from '../../components/layout/Section';
import BaseCard from '../../components/cards/BaseCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import OutlineButton from '../../components/common/OutlineButton';
import FormInput from '../../components/forms/FormInput';
import FormTextarea from '../../components/forms/FormTextarea';
import LoadingState from '../../components/feedback/LoadingState';

const EXPENSE_CATEGORIES = [
  'Veterinary consultation',
  'Medicines',
  'Surgery',
  'Medical tests',
  'Food and nutrition',
  'Transportation',
  'Shelter',
  'Other',
];

export const NewExpensePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [myCases, setMyCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [caseAllocations, setCaseAllocations] = useState([]);
  const [selectedAllocationId, setSelectedAllocationId] = useState('');
  const [selectedAllocData, setSelectedAllocData] = useState(null);
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingAllocations, setLoadingAllocations] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Veterinary consultation');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [documentType, setDocumentType] = useState('Hospital Invoice / Medical Bill');
  const [documentDescription, setDocumentDescription] = useState('');
  const [files, setFiles] = useState([]);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch rescuer's approved cases on load
  useEffect(() => {
    const fetchRescuerCases = async () => {
      try {
        setLoadingCases(true);
        const data = await getMyCases();
        if (data && data.success) {
          const approved = (data.cases || []).filter(
            (c) => c.verificationStatus === 'Approved'
          );
          setMyCases(approved);
          if (approved.length > 0) {
            setSelectedCaseId(approved[0]._id);
          }
        }
      } catch (err) {
        setErrorMessage(err.message || 'Failed to load your rescue cases.');
      } finally {
        setLoadingCases(false);
      }
    };
    fetchRescuerCases();
  }, []);

  // When selected case changes, fetch active allocations
  useEffect(() => {
    const fetchAllocations = async () => {
      if (!selectedCaseId) return;
      try {
        setLoadingAllocations(true);
        const data = await getAdminCaseFinancials(selectedCaseId);
        if (data && data.success) {
          const activeAllocs = (data.allocations || []).filter(
            (a) => a.status === 'Active' || a.status === 'Partially Spent'
          );
          setCaseAllocations(activeAllocs);
          if (activeAllocs.length > 0) {
            setSelectedAllocationId(activeAllocs[0]._id);
            setSelectedAllocData(activeAllocs[0]);
          } else {
            setSelectedAllocationId('');
            setSelectedAllocData(null);
          }
        }
      } catch {
        setCaseAllocations([]);
        setSelectedAllocationId('');
        setSelectedAllocData(null);
      } finally {
        setLoadingAllocations(false);
      }
    };
    fetchAllocations();
  }, [selectedCaseId]);

  const handleCaseChange = (e) => {
    setSelectedCaseId(e.target.value);
    setErrorMessage('');
  };

  const handleAllocationChange = (e) => {
    const allocId = e.target.value;
    setSelectedAllocationId(allocId);
    const matched = caseAllocations.find((a) => a._id === allocId);
    setSelectedAllocData(matched || null);
    setErrorMessage('');
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (files.length + selected.length > 5) {
      alert('You can upload up to 5 documents per expense submission.');
      return;
    }
    setFiles((prev) => [...prev, ...selected]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCaseId) {
      setErrorMessage('Please select a rescue case.');
      return;
    }
    if (!selectedAllocationId) {
      setErrorMessage('Please select an active fund allocation.');
      return;
    }

    const num = Number(amount);
    if (isNaN(num) || num <= 0) {
      setErrorMessage('Please enter a valid positive expense amount.');
      return;
    }

    const availableBalance = selectedAllocData
      ? Math.max(0, selectedAllocData.amount - (selectedAllocData.amountSpent || 0))
      : 0;

    if (num > availableBalance) {
      setErrorMessage(
        `Expense amount (₹${num.toLocaleString()}) exceeds the available unspent allocation balance (₹${availableBalance.toLocaleString()}).`
      );
      return;
    }

    if (files.length === 0) {
      setErrorMessage('Please attach at least one proof document (bill, invoice, or receipt).');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');

      const formData = new FormData();
      formData.append('caseId', selectedCaseId);
      formData.append('allocationId', selectedAllocationId);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('expenseCategory', expenseCategory);
      formData.append('amount', num);
      formData.append('expenseDate', expenseDate);
      formData.append('documentType', documentType);
      formData.append('documentDescription', documentDescription);

      files.forEach((file) => {
        formData.append('documents', file);
      });

      const res = await submitExpense(formData);
      setSubmitting(false);

      if (res && res.success) {
        navigate('/rescuer/expenses');
      }
    } catch (err) {
      setSubmitting(false);
      setErrorMessage(err.message || 'Failed to submit expense proof.');
    }
  };

  const availableBalance = selectedAllocData
    ? Math.max(0, selectedAllocData.amount - (selectedAllocData.amountSpent || 0))
    : 0;

  return (
    <Section spacing="default" className="py-8 sm:py-12">
      <Container size="default">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/rescuer/expenses"
            className="inline-flex items-center text-xs font-semibold text-charcoal-muted hover:text-forest transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Expense History
          </Link>
          <span className="text-xs font-mono text-charcoal-muted">Rescuer Intake Portal</span>
        </div>

        {/* Global Academic Disclosure */}
        <div className="rounded-2xl p-4 mb-8 bg-amber-50/90 border border-amber-200 text-xs text-amber-950 flex items-start gap-3 shadow-warm-xs">
          <AlertCircle className="w-5 h-5 text-amber-800 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5 font-sans">
            <strong className="block text-sm font-serif font-bold text-amber-950">
              Academic Demonstration System — Simulated Expenses
            </strong>
            <p className="leading-relaxed text-[11px]">
              This submission portal allows rescuers to upload demonstration veterinary clinic bills and receipts. No live financial transfers, banking disbursements, or tax deductions are transacted.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
          {/* Main Form */}
          <div className="lg:col-span-8">
            <BaseCard padding="lg" className="space-y-6 bg-white shadow-warm border border-grey-light">
              <div className="border-b border-grey-light pb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-forest font-sans">
                  Section A & B: Rescue Case & Allocation
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest mt-1">
                  Submit Treatment Expense Proof
                </h1>
                <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                  Upload attending veterinary clinic invoices, surgery receipts, or pharmacy bills to unlock verified escrow spending.
                </p>
              </div>

              {loadingCases ? (
                <div className="py-10">
                  <LoadingState message="Loading your approved rescue cases..." />
                </div>
              ) : myCases.length === 0 ? (
                <div className="p-6 rounded-2xl bg-ivory-warm border border-grey-light text-center text-xs text-charcoal-muted space-y-3">
                  <Receipt className="w-8 h-8 text-charcoal-muted mx-auto" />
                  <p>
                    You do not have any <strong>Approved</strong> rescue cases yet. Expenses can only be submitted for approved campaigns with active fund allocations.
                  </p>
                  <Link to="/rescuer/cases/new">
                    <PrimaryButton size="sm">Submit Emergency Case</PrimaryButton>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 text-xs">
                  {/* Section A: Select Case */}
                  <div className="space-y-1.5">
                    <label className="block font-semibold text-charcoal">
                      Select Approved Rescue Case
                    </label>
                    <select
                      value={selectedCaseId}
                      onChange={handleCaseChange}
                      className="w-full p-3 rounded-xl bg-ivory-warm/60 border border-grey-light text-xs text-charcoal font-medium outline-none focus:ring-2 focus:ring-forest/20"
                      required
                    >
                      {myCases.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.animalName} — {c.title} ({c.location})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Section B: Select Allocation */}
                  <div className="space-y-1.5">
                    <label className="block font-semibold text-charcoal">
                      Linked Fund Allocation
                    </label>
                    {loadingAllocations ? (
                      <p className="text-charcoal-muted text-[11px]">Loading case allocations...</p>
                    ) : caseAllocations.length === 0 ? (
                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                        No active fund allocations have been assigned to this rescue case by platform administrators yet. You cannot submit expenses until an admin allocates funds under Module 7.
                      </div>
                    ) : (
                      <select
                        value={selectedAllocationId}
                        onChange={handleAllocationChange}
                        className="w-full p-3 rounded-xl bg-ivory-warm/60 border border-grey-light text-xs text-charcoal font-medium outline-none focus:ring-2 focus:ring-forest/20"
                        required
                      >
                        {caseAllocations.map((a) => {
                          const rem = Math.max(0, a.amount - (a.amountSpent || 0));
                          return (
                            <option key={a._id} value={a._id}>
                              {a.allocationReference} — {a.allocationCategory} (Remaining: ₹{rem.toLocaleString()} of ₹{a.amount.toLocaleString()})
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>

                  {/* Section C: Expense Info */}
                  <div className="pt-4 border-t border-grey-light space-y-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-forest block">
                      Section C: Expense Information
                    </span>

                    <FormInput
                      label="Expense Title"
                      placeholder="e.g. Femur fixation plate surgery & anesthesia invoice"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block font-semibold text-charcoal">
                          Expense Category
                        </label>
                        <select
                          value={expenseCategory}
                          onChange={(e) => setExpenseCategory(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-ivory-warm/60 border border-grey-light text-xs text-charcoal font-medium outline-none focus:ring-2 focus:ring-forest/20"
                        >
                          {EXPENSE_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <FormInput
                          label="Expense Incurred Date"
                          type="date"
                          max={new Date().toISOString().slice(0, 10)}
                          value={expenseDate}
                          onChange={(e) => setExpenseDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <FormInput
                        label="Expense Amount (₹ INR)"
                        type="number"
                        min="1"
                        max={availableBalance || undefined}
                        placeholder={`Up to available ₹${availableBalance.toLocaleString()}`}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                      />
                      <span className="text-[11px] text-charcoal-muted">
                        Amount must not exceed available allocation balance of ₹{availableBalance.toLocaleString()}.
                      </span>
                    </div>

                    <FormTextarea
                      label="Clinical & Treatment Narrative"
                      rows={3}
                      placeholder="Describe medicines purchased, procedure performed by attending veterinary doctor, or clinic bill items..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  {/* Section D: Supporting Evidence */}
                  <div className="pt-4 border-t border-grey-light space-y-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-forest block">
                      Section D: Supporting Evidence & Documents
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormInput
                        label="Document Type"
                        placeholder="e.g. Hospital Invoice, Clinic Bill, Lab Report"
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                      />
                      <FormInput
                        label="Document Description / Invoice Number"
                        placeholder="e.g. Cessna Lifeline Tax Invoice #9821"
                        value={documentDescription}
                        onChange={(e) => setDocumentDescription(e.target.value)}
                      />
                    </div>

                    {/* Drag and Drop / File Input Box */}
                    <div className="border-2 border-dashed border-grey-light hover:border-forest rounded-2xl p-6 text-center bg-ivory-warm/40 transition-colors">
                      <Upload className="w-8 h-8 text-forest mx-auto mb-2 opacity-70" />
                      <span className="text-xs font-semibold text-charcoal block">
                        Upload Supporting Receipts & Invoices
                      </span>
                      <p className="text-[11px] text-charcoal-muted mt-0.5">
                        Accepted formats: JPEG, PNG, WebP images and PDF documents (Max 10MB per file, up to 5 files).
                      </p>
                      <label className="mt-3 inline-block cursor-pointer">
                        <input
                          type="file"
                          multiple
                          accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <span className="px-4 py-2 rounded-xl bg-forest text-ivory text-xs font-semibold shadow-warm-xs hover:bg-forest-light transition-colors inline-block">
                          Select Files from Device
                        </span>
                      </label>
                    </div>

                    {/* Uploaded Files Previews */}
                    {files.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <span className="text-[11px] font-semibold text-charcoal-muted uppercase block">
                          Selected Documents ({files.length} of 5)
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {files.map((file, idx) => {
                            const isImg = file.type.startsWith('image/');
                            const previewUrl = isImg ? URL.createObjectURL(file) : null;

                            return (
                              <div
                                key={idx}
                                className="p-2.5 rounded-xl bg-ivory-warm border border-grey-light flex items-center justify-between gap-3 text-xs"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {isImg ? (
                                    <img
                                      src={previewUrl}
                                      alt="Preview"
                                      className="w-10 h-10 rounded-lg object-cover border border-grey-light flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-forest/10 text-forest flex items-center justify-center flex-shrink-0">
                                      <File className="w-5 h-5" />
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <div className="font-semibold text-charcoal truncate">
                                      {file.name}
                                    </div>
                                    <div className="text-[10px] text-charcoal-muted">
                                      {(file.size / 1024).toFixed(1)} KB
                                    </div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFile(idx)}
                                  className="p-1 rounded-lg text-charcoal-muted hover:text-rose-700 hover:bg-rose-50"
                                  title="Remove document"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Section E: Review and Submit CTA */}
                  <div className="pt-4 border-t border-grey-light flex items-center justify-end gap-3">
                    <Link to="/rescuer/expenses">
                      <OutlineButton size="md" disabled={submitting}>
                        Cancel
                      </OutlineButton>
                    </Link>
                    <PrimaryButton
                      type="submit"
                      size="md"
                      isLoading={submitting}
                      disabled={caseAllocations.length === 0}
                    >
                      Submit for Admin Verification
                    </PrimaryButton>
                  </div>
                </form>
              )}
            </BaseCard>
          </div>

          {/* Right Sidebar: Allocation Context */}
          <div className="lg:col-span-4 space-y-6">
            <BaseCard padding="md" className="space-y-3 bg-white shadow-warm-xs border border-grey-light">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted block border-b border-grey-light pb-2">
                Linked Escrow Commitment
              </span>

              {selectedAllocData ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Ref Code:</span>
                    <strong className="font-mono text-forest">{selectedAllocData.allocationReference}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Category:</span>
                    <span className="font-semibold">{selectedAllocData.allocationCategory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Allocated Amount:</span>
                    <strong>₹{selectedAllocData.amount.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Already Verified:</span>
                    <span>₹{(selectedAllocData.amountSpent || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-grey-light font-semibold">
                    <span className="text-charcoal">Available for this claim:</span>
                    <strong className="text-emerald-800 text-sm">
                      ₹{availableBalance.toLocaleString()}
                    </strong>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-charcoal-muted italic">
                  Select a rescue case with an active fund allocation to view balance limits.
                </p>
              )}
            </BaseCard>

            <BaseCard padding="md" className="space-y-3 bg-white shadow-warm-xs border border-grey-light">
              <div className="flex items-center gap-1.5 text-forest border-b border-grey-light pb-2">
                <ShieldCheck className="w-4 h-4 text-forest" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Verification Safeguards
                </span>
              </div>
              <ul className="space-y-2 text-[11px] text-charcoal-muted leading-relaxed">
                <li>• All claims default to <strong>Pending</strong> verification.</li>
                <li>• Invoices are reviewed against registered veterinary hospital credentials.</li>
                <li>• Only approved claims count as verified spending on the transparency dashboard.</li>
                <li>• Claims exceeding the allocated balance are rejected automatically.</li>
              </ul>
            </BaseCard>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default NewExpensePage;
