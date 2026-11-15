import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { getPublicCases } from '../services/api';
import Container from '../components/layout/Container';
import Section from '../components/layout/Section';
import PageHeader from '../components/layout/PageHeader';
import RescueCaseCard from '../components/cards/RescueCaseCard';
import FormInput from '../components/forms/FormInput';
import FormSelect from '../components/forms/FormSelect';
import OutlineButton from '../components/common/OutlineButton';
import LoadingState from '../components/feedback/LoadingState';
import EmptyState from '../components/feedback/EmptyState';

export const CasesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [cases, setCases] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and filter state synced with searchParams
  const search = searchParams.get('search') || '';
  const animalType = searchParams.get('animalType') || 'All';
  const urgencyLevel = searchParams.get('urgencyLevel') || 'All';
  const sort = searchParams.get('sort') || 'recent';

  const [searchTerm, setSearchTerm] = useState(search);

  // Fetch public verified cases from backend
  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        search: search.trim() || undefined,
        animalType: animalType !== 'All' ? animalType : undefined,
        urgencyLevel: urgencyLevel !== 'All' ? urgencyLevel : undefined,
        sort,
      };

      const data = await getPublicCases(params);
      if (data && data.success) {
        setCases(data.cases || []);
        setTotalCount(data.totalCount || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load emergency rescue campaigns.');
    } finally {
      setLoading(false);
    }
  }, [search, animalType, urgencyLevel, sort]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'All') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters('search', searchTerm.trim());
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <Section spacing="default" className="py-8 sm:py-14">
      <Container>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-grey-light mb-8">
          <PageHeader
            eyebrow="Emergency Triage & Crowdfunding"
            title="Emergency Rescue Cases"
            subtitle="Discover animals who need urgent care and follow their journey towards recovery. Every case is triaged with physical clinic bills."
          />

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-sage-wash text-forest border border-sage/40">
              <ShieldCheck className="w-3.5 h-3.5 text-forest" />
              {totalCount} Active Verified Cases
            </span>
          </div>
        </div>

        {/* Academic Simulation Banner */}
        <div className="rounded-xl p-4 mb-8 bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-800 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Simulated Academic Demonstration:</strong> All campaign goals and funding totals represent educational simulation records. No live financial payments or actual bank transfers are executed.
          </span>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-5 border border-grey-light shadow-warm-sm mb-10 space-y-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            <div className="md:col-span-5">
              <FormInput
                id="caseSearch"
                placeholder="Search by animal name, title, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
              />
            </div>

            <div className="md:col-span-2">
              <FormSelect
                id="filterAnimal"
                value={animalType}
                onChange={(e) => updateFilters('animalType', e.target.value)}
                placeholder="Animal Type"
                options={[
                  { value: 'All', label: 'All Animals' },
                  { value: 'Dog', label: 'Dogs' },
                  { value: 'Cat', label: 'Cats' },
                  { value: 'Other', label: 'Other Strays' },
                ]}
              />
            </div>

            <div className="md:col-span-2">
              <FormSelect
                id="filterUrgency"
                value={urgencyLevel}
                onChange={(e) => updateFilters('urgencyLevel', e.target.value)}
                placeholder="Urgency"
                options={[
                  { value: 'All', label: 'All Urgencies' },
                  { value: 'Critical', label: 'Critical' },
                  { value: 'Urgent', label: 'Urgent' },
                  { value: 'Normal', label: 'Normal' },
                ]}
              />
            </div>

            <div className="md:col-span-2">
              <FormSelect
                id="sortOrder"
                value={sort}
                onChange={(e) => updateFilters('sort', e.target.value)}
                placeholder="Sort By"
                options={[
                  { value: 'recent', label: 'Most Recent' },
                  { value: 'urgency', label: 'Highest Urgency' },
                  { value: 'progress', label: 'Highest Progress' },
                  { value: 'goal_asc', label: 'Goal: Low to High' },
                ]}
              />
            </div>

            <div className="md:col-span-1 flex items-center">
              <button
                type="submit"
                className="w-full h-10 px-3 rounded-xl bg-forest text-ivory hover:bg-forest-light text-xs font-semibold flex items-center justify-center transition-colors shadow-warm-sm"
                title="Apply Search"
              >
                Search
              </button>
            </div>
          </form>

          {/* Active Filter Tags */}
          {(search || animalType !== 'All' || urgencyLevel !== 'All' || sort !== 'recent') && (
            <div className="pt-2 border-t border-grey-light/60 flex items-center justify-between text-xs text-charcoal-muted flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span>Active Filters:</span>
                {search && (
                  <span className="px-2 py-0.5 rounded bg-forest-subtle text-forest font-medium">
                    Keyword: &ldquo;{search}&rdquo;
                  </span>
                )}
                {animalType !== 'All' && (
                  <span className="px-2 py-0.5 rounded bg-sage-wash text-forest font-medium">
                    Type: {animalType}
                  </span>
                )}
                {urgencyLevel !== 'All' && (
                  <span className="px-2 py-0.5 rounded bg-orange-subtle text-orange-muted font-medium">
                    Urgency: {urgencyLevel}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs text-forest hover:underline font-semibold"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Content States */}
        {loading ? (
          <div className="py-20">
            <LoadingState
              message="Loading verified emergency cases..."
              subtext="Connecting to database and verifying triage approvals"
            />
          </div>
        ) : error ? (
          <div className="py-12">
            <EmptyState
              icon={AlertCircle}
              title="Failed to Load Cases"
              description={error}
              action={
                <OutlineButton icon={RefreshCw} onClick={fetchCases}>
                  Retry Connection
                </OutlineButton>
              }
            />
          </div>
        ) : cases.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="No Rescue Cases Found"
              description="No active emergency campaigns match your chosen search terms or filter criteria."
              action={
                <OutlineButton onClick={clearAllFilters}>
                  Reset All Filters
                </OutlineButton>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cases.map((c) => {
              // Format image URL: local uploads or external Unsplash links
              const firstImage =
                c.images && c.images.length > 0
                  ? c.images[0].startsWith('http')
                    ? c.images[0]
                    : `http://localhost:5000${c.images[0]}`
                  : null;

              return (
                <RescueCaseCard
                  key={c._id}
                  id={c._id}
                  title={c.title}
                  animalType={c.animalType}
                  location={c.location}
                  injuryDescription={c.injuryDescription}
                  urgency={c.urgencyLevel.toLowerCase()}
                  currentAmount={c.amountCollected}
                  targetAmount={c.fundraisingGoal}
                  donorCount={Math.max(1, Math.round(c.amountCollected / 350))}
                  image={firstImage}
                  caseUrl={`/cases/${c._id}`}
                  onDonate={() => {
                    // Navigate to donation placeholder
                    window.location.href = `/donate/${c._id}`;
                  }}
                />
              );
            })}
          </div>
        )}
      </Container>
    </Section>
  );
};

export default CasesPage;
