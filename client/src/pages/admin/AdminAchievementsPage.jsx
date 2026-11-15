import { useState, useEffect } from 'react';
import {
  Award,
  PlusCircle,
  Edit,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  AlertCircle,
  Users,
} from 'lucide-react';
import {
  getAdminAchievements,
  createAdminAchievement,
  updateAdminAchievement,
  toggleAdminAchievementStatus,
} from '../../services/api';
import Container from '../../components/layout/Container';
import Section from '../../components/layout/Section';
import BaseCard from '../../components/cards/BaseCard';
import StatCard from '../../components/cards/StatCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import OutlineButton from '../../components/common/OutlineButton';
import FormInput from '../../components/forms/FormInput';
import FormTextarea from '../../components/forms/FormTextarea';
import LoadingState from '../../components/feedback/LoadingState';
import EmptyState from '../../components/feedback/EmptyState';

export const AdminAchievementsPage = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Award');
  const [category, setCategory] = useState('milestone');
  const [criteriaType, setCriteriaType] = useState('donation_count');
  const [criteriaValue, setCriteriaValue] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminAchievements();
      if (data && data.success) {
        setAchievements(data.achievements || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load achievements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setIcon('Award');
    setCategory('milestone');
    setCriteriaType('donation_count');
    setCriteriaValue(1);
    setIsActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ach) => {
    setEditingId(ach._id);
    setName(ach.name);
    setSlug(ach.slug);
    setDescription(ach.description);
    setIcon(ach.icon);
    setCategory(ach.category);
    setCriteriaType(ach.criteriaType);
    setCriteriaValue(ach.criteriaValue);
    setIsActive(ach.isActive);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Please enter a badge name.');
      return;
    }
    if (criteriaValue <= 0) {
      setFormError('Criteria threshold must be at least 1.');
      return;
    }

    try {
      setFormLoading(true);
      setFormError('');

      const payload = {
        name,
        slug,
        description,
        icon,
        category,
        criteriaType,
        criteriaValue: Number(criteriaValue),
        isActive,
      };

      if (editingId) {
        await updateAdminAchievement(editingId, payload);
      } else {
        await createAdminAchievement(payload);
      }

      setFormLoading(false);
      handleCloseModal();
      fetchAchievements();
    } catch (err) {
      setFormLoading(false);
      setFormError(err.message || 'Failed to save achievement badge.');
    }
  };

  const handleToggleStatus = async (ach) => {
    try {
      await toggleAdminAchievementStatus(ach._id, !ach.isActive);
      fetchAchievements();
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const totalEarnedAcrossPlatform = achievements.reduce(
    (acc, cur) => acc + (cur.recipientsCount || 0),
    0
  );

  return (
    <Section spacing="default" className="py-8 sm:py-12 font-sans">
      <Container size="default">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-grey-light mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-800">
                Admin Control Center
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-700 text-white font-medium">
                Gamification & Recognition
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
              Achievement Badges & Criteria
            </h1>
            <p className="text-xs text-charcoal-muted mt-1">
              Configure automated badge award criteria, categories, and review community distribution statistics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <OutlineButton size="sm" icon={RefreshCw} onClick={fetchAchievements}>
              Refresh
            </OutlineButton>
            <PrimaryButton size="sm" icon={PlusCircle} onClick={handleOpenCreateModal}>
              New Badge Definition
            </PrimaryButton>
          </div>
        </div>

        {/* 3 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Total Configured Badges"
            value={String(achievements.length)}
            subtitle="Active and inactive definitions"
            colorScheme="forest"
            icon={Award}
          />
          <StatCard
            title="Active Recognition Badges"
            value={String(achievements.filter((a) => a.isActive).length)}
            subtitle="Currently evaluated for donors"
            colorScheme="sage"
            icon={CheckCircle2}
          />
          <StatCard
            title="Total Badges Awarded"
            value={String(totalEarnedAcrossPlatform)}
            subtitle="Platform-wide donor achievements"
            colorScheme="orange"
            icon={Users}
          />
        </div>

        {/* Badges Table */}
        {loading ? (
          <div className="py-16">
            <LoadingState
              message="Loading achievement definitions..."
              subtext="Aggregating community recipient distributions"
            />
          </div>
        ) : error ? (
          <div className="py-12">
            <EmptyState icon={AlertCircle} title="Unable to Load" description={error} />
          </div>
        ) : achievements.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Award}
              title="No Badges Configured"
              description="Click below to create the initial badge definitions."
              action={
                <PrimaryButton size="sm" icon={PlusCircle} onClick={handleOpenCreateModal}>
                  Create Badge
                </PrimaryButton>
              }
            />
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-grey-light bg-white shadow-warm-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-ivory-warm border-b border-grey-light text-charcoal-muted uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4 font-semibold">Badge Details</th>
                    <th className="py-3.5 px-4 font-semibold">Slug Identifier</th>
                    <th className="py-3.5 px-4 font-semibold">Category</th>
                    <th className="py-3.5 px-4 font-semibold">Criteria Threshold</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Recipients</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-light/60">
                  {achievements.map((ach) => (
                    <tr key={ach._id} className="hover:bg-ivory-warm/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-forest text-sm">{ach.name}</div>
                        <div className="text-charcoal-muted text-[11px] truncate max-w-xs mt-0.5">
                          {ach.description}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-charcoal">
                        {ach.slug}
                      </td>
                      <td className="py-3.5 px-4 capitalize">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-forest/10 text-forest font-semibold">
                          {ach.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-charcoal">
                          {ach.criteriaValue}{' '}
                        </span>
                        <span className="text-charcoal-muted text-[11px]">
                          {ach.criteriaType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-semibold text-forest">
                          <Users className="w-3.5 h-3.5 text-sage-dark" />
                          {ach.recipientsCount || 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                            ach.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-grey-light text-charcoal-muted'
                          }`}
                        >
                          {ach.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <OutlineButton
                            size="xs"
                            icon={Edit}
                            onClick={() => handleOpenEditModal(ach)}
                          >
                            Edit
                          </OutlineButton>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(ach)}
                            className="p-1 text-charcoal-muted hover:text-forest transition-colors"
                            title={ach.isActive ? 'Deactivate Badge' : 'Activate Badge'}
                          >
                            {ach.isActive ? (
                              <ToggleRight className="w-5 h-5 text-emerald-700" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-charcoal-muted" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create / Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-warm-lg border border-grey-light space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-grey-light pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-forest" />
                  <h3 className="font-serif text-lg font-bold text-forest">
                    {editingId ? 'Edit Achievement Badge' : 'New Achievement Definition'}
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

              <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                  label="Badge Name"
                  required
                  placeholder="e.g. Animal Advocate"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                />

                <FormInput
                  label="Slug Identifier"
                  placeholder="e.g. animal-advocate (auto-generated if blank)"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  disabled={Boolean(editingId)} // Slugs are immutable once set
                />

                <FormTextarea
                  label="Description"
                  required
                  rows={3}
                  placeholder="e.g. Awarded after supporting 10 simulated donations."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-charcoal">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full text-xs rounded-xl border border-grey-light px-3 py-2 bg-ivory-warm/40"
                    >
                      <option value="milestone">Milestone</option>
                      <option value="frequency">Frequency</option>
                      <option value="diversity">Diversity</option>
                      <option value="special">Special</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-charcoal">Criteria Type</label>
                    <select
                      value={criteriaType}
                      onChange={(e) => setCriteriaType(e.target.value)}
                      className="w-full text-xs rounded-xl border border-grey-light px-3 py-2 bg-ivory-warm/40"
                    >
                      <option value="donation_count">Total Donation Count</option>
                      <option value="distinct_cases">Distinct Cases Supported</option>
                      <option value="distinct_months">Distinct Calendar Months</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormInput
                    label="Criteria Value Threshold"
                    type="number"
                    min={1}
                    required
                    value={criteriaValue}
                    onChange={(e) => setCriteriaValue(e.target.value)}
                  />

                  <div className="space-y-1 flex flex-col justify-center pt-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-charcoal">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="rounded border-grey-light text-forest focus:ring-forest"
                      />
                      <span>Active for donor evaluation</span>
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-grey-light flex items-center justify-end gap-2.5">
                  <OutlineButton size="sm" type="button" onClick={handleCloseModal}>
                    Cancel
                  </OutlineButton>
                  <PrimaryButton size="sm" type="submit" disabled={formLoading}>
                    {formLoading ? 'Saving...' : editingId ? 'Update Badge' : 'Create Badge'}
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

export default AdminAchievementsPage;
