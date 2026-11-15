import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Megaphone,
  PlusCircle,
  Archive,
  Edit,
  Eye,
  AlertTriangle,
  Info,
  Flame,
  Calendar,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import {
  getAdminAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  archiveAnnouncement,
} from '../../services/api';
import Container from '../../components/layout/Container';
import Section from '../../components/layout/Section';
import BaseCard from '../../components/cards/BaseCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import OutlineButton from '../../components/common/OutlineButton';
import FormInput from '../../components/forms/FormInput';
import FormTextarea from '../../components/forms/FormTextarea';
import StatusBadge from '../../components/feedback/StatusBadge';
import LoadingState from '../../components/feedback/LoadingState';
import EmptyState from '../../components/feedback/EmptyState';

export const AdminAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('general');
  const [status, setStatus] = useState('draft');
  const [priority, setPriority] = useState(0);
  const [startAt, setStartAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminAnnouncements({ status: statusFilter });
      if (data && data.success) {
        setAnnouncements(data.announcements || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [statusFilter]);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setMessage('');
    setType('general');
    setStatus('draft');
    setPriority(0);
    setStartAt(new Date().toISOString().slice(0, 16));
    setExpiresAt('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (a) => {
    setEditingId(a._id);
    setTitle(a.title);
    setMessage(a.message);
    setType(a.type);
    setStatus(a.status);
    setPriority(a.priority || 0);
    setStartAt(a.startAt ? new Date(a.startAt).toISOString().slice(0, 16) : '');
    setExpiresAt(a.expiresAt ? new Date(a.expiresAt).toISOString().slice(0, 16) : '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormError('');
  };

  const handleSubmitAnnouncement = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Please enter an announcement title.');
      return;
    }
    if (!message.trim()) {
      setFormError('Please enter announcement message content.');
      return;
    }

    if (type === 'emergency' && status === 'published') {
      const confirmed = window.confirm(
        'Confirm publishing an EMERGENCY ALERT? This banner will display prominently at the top of the homepage.'
      );
      if (!confirmed) return;
    }

    try {
      setFormLoading(true);
      setFormError('');

      const payload = {
        title,
        message,
        type,
        status,
        priority: Number(priority),
        startAt: startAt || undefined,
        expiresAt: expiresAt || null,
      };

      if (editingId) {
        await updateAnnouncement(editingId, payload);
      } else {
        await createAnnouncement(payload);
      }

      setFormLoading(false);
      handleCloseModal();
      fetchAnnouncements();
    } catch (err) {
      setFormLoading(false);
      setFormError(err.message || 'Failed to save announcement.');
    }
  };

  const handleArchive = async (id) => {
    if (!window.confirm('Are you sure you want to archive this announcement? It will no longer appear publicly.')) {
      return;
    }

    try {
      await archiveAnnouncement(id);
      fetchAnnouncements();
    } catch (err) {
      alert(`Failed to archive: ${err.message}`);
    }
  };

  return (
    <Section spacing="default" className="py-8 sm:py-12">
      <Container size="default">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-grey-light mb-8 font-sans">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-800">
                Admin Control Center
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-700 text-white font-medium">
                Broadcasts
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
              Emergency & Platform Announcements
            </h1>
            <p className="text-xs text-charcoal-muted mt-1">
              Publish critical rescue alerts, animal disaster triage updates, and academic platform notices.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <OutlineButton size="sm" icon={RefreshCw} onClick={fetchAnnouncements}>
              Refresh
            </OutlineButton>
            <PrimaryButton size="sm" icon={PlusCircle} onClick={handleOpenCreateModal}>
              New Announcement
            </PrimaryButton>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-grey-light pb-2 font-sans overflow-x-auto">
          {['all', 'published', 'draft', 'archived'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                statusFilter === tab
                  ? 'bg-forest text-ivory shadow-warm-xs'
                  : 'text-charcoal-muted hover:text-charcoal hover:bg-grey-light/40'
              }`}
            >
              {tab === 'all' ? 'All Broadcasts' : tab}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="py-16">
            <LoadingState message="Loading announcements..." subtext="Retrieving platform broadcasts" />
          </div>
        ) : error ? (
          <div className="py-12">
            <EmptyState icon={AlertTriangle} title="Unable to Load" description={error} />
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Megaphone}
              title="No Announcements Found"
              description="No announcements recorded in this status."
              action={
                <PrimaryButton size="sm" icon={PlusCircle} onClick={handleOpenCreateModal}>
                  Create Announcement
                </PrimaryButton>
              }
            />
          </div>
        ) : (
          <div className="space-y-4 font-sans">
            {announcements.map((a) => (
              <BaseCard
                key={a._id}
                padding="md"
                className="bg-white shadow-warm-xs border border-grey-light hover:shadow-warm-sm transition-shadow space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-grey-light/60 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                        a.type === 'emergency'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : a.type === 'urgent'
                          ? 'bg-orange-100 text-orange-800 border border-orange-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {a.type}
                    </span>
                    <StatusBadge
                      status={
                        a.status === 'published'
                          ? 'verified'
                          : a.status === 'archived'
                          ? 'rejected'
                          : 'pending'
                      }
                      label={a.status}
                    />
                    <span className="text-xs text-charcoal-muted">
                      Priority: {a.priority}
                    </span>
                  </div>

                  <div className="text-xs text-charcoal-muted flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {a.startAt ? new Date(a.startAt).toLocaleDateString() : 'Immediate'}
                      {a.expiresAt ? ` — Exp: ${new Date(a.expiresAt).toLocaleDateString()}` : ' (No expiry)'}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-serif text-lg font-bold text-forest">{a.title}</h3>
                  <p className="text-xs text-charcoal leading-relaxed mt-1 whitespace-pre-line">
                    {a.message}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-grey-light/60 text-xs">
                  <span className="text-charcoal-muted text-[11px]">
                    Created by {a.createdBy?.name || 'Admin'}
                  </span>
                  <div className="flex items-center gap-2">
                    <OutlineButton size="xs" icon={Edit} onClick={() => handleOpenEditModal(a)}>
                      Edit
                    </OutlineButton>
                    {a.status !== 'archived' && (
                      <OutlineButton
                        size="xs"
                        icon={Archive}
                        onClick={() => handleArchive(a._id)}
                        className="text-rose-800 border-rose-200 hover:bg-rose-50"
                      >
                        Archive
                      </OutlineButton>
                    )}
                  </div>
                </div>
              </BaseCard>
            ))}
          </div>
        )}

        {/* Create / Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-warm-lg border border-grey-light space-y-4 font-sans max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-grey-light pb-3">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-forest" />
                  <h3 className="font-serif text-lg font-bold text-forest">
                    {editingId ? 'Edit Announcement' : 'Create Platform Announcement'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="text-charcoal-muted hover:text-charcoal"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmitAnnouncement} className="space-y-4">
                <FormInput
                  label="Title"
                  required
                  placeholder="e.g. Critical Heatwave Advisory: Street Dog Hydration Drives"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={140}
                />

                <FormTextarea
                  label="Announcement Message"
                  required
                  rows={4}
                  placeholder="Provide urgent instructions, clinic triage hours, or platform updates..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={3000}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-charcoal">Severity Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full text-xs rounded-xl border border-grey-light px-3 py-2 bg-ivory-warm/40"
                    >
                      <option value="general">General Info</option>
                      <option value="urgent">Urgent</option>
                      <option value="emergency">Emergency Alert</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-charcoal">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full text-xs rounded-xl border border-grey-light px-3 py-2 bg-ivory-warm/40"
                    >
                      <option value="draft">Save as Draft</option>
                      <option value="published">Publish Live</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-charcoal">Priority (0-10)</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full text-xs rounded-xl border border-grey-light px-3 py-2 bg-ivory-warm/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormInput
                    label="Active Start Date / Time"
                    type="datetime-local"
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                  />
                  <FormInput
                    label="Optional Expiry Date / Time"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>

                <div className="pt-3 border-t border-grey-light flex items-center justify-end gap-2.5">
                  <OutlineButton size="sm" type="button" onClick={handleCloseModal}>
                    Cancel
                  </OutlineButton>
                  <PrimaryButton size="sm" type="submit" disabled={formLoading}>
                    {formLoading ? 'Saving...' : editingId ? 'Update Broadcast' : 'Save Announcement'}
                  </PrimaryButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
};

export default AdminAnnouncementsPage;
