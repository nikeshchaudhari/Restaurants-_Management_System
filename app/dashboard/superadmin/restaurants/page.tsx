'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';

// ─── Types ─────────────────────────────────────────
type RestaurantStatus = 'Active' | 'Pending' | 'Paused' | 'Archived';
type PlanTier = 'Basic' | 'Growth' | 'Enterprise';

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  company: string;
  status: RestaurantStatus;
  owner: string;
  email: string;
  plan: PlanTier;
  planLabel: string;
  price: string;
  payment: 'Paid' | 'Pending' | 'Overdue';
  created: string;
  region: 'Kathmandu' | 'Pokhara' | 'Lalitpur' | 'Chitwan' | 'Butwal' | 'Nagarkot';
}

// ─── Mock Data ─────────────────────────────────────
const ALL_RESTAURANTS: Restaurant[] = [
  {
    id: 1,
    name: 'Pokhara Lakeside Terrace',
    slug: 'pokhara-lakeside-terrace',
    company: 'Saffron & Stone Hospitality',
    status: 'Active',
    owner: 'Aayush Manandhar',
    email: 'aayush.m@saffronstone.np',
    plan: 'Enterprise',
    planLabel: 'Pro',
    price: 'Rs. 8,500/mo',
    payment: 'Paid',
    created: 'Jan 04, 2025',
    region: 'Pokhara',
  },
  {
    id: 2,
    name: 'Kathmandu Durbar Hub',
    slug: 'kathmandu-durbar-hub',
    company: 'Saffron & Stone Hospitality',
    status: 'Active',
    owner: 'Bipin Shrestha',
    email: 'bipin.s@saffronstone.np',
    plan: 'Enterprise',
    planLabel: 'Pro',
    price: 'Rs. 8,500/mo',
    payment: 'Paid',
    created: 'Nov 12, 2024',
    region: 'Kathmandu',
  },
  {
    id: 3,
    name: 'Nagarkot Heights Vista',
    slug: 'nagarkot-heights-vista',
    company: 'Saffron & Stone Hospitality',
    status: 'Active',
    owner: 'Smriti KC',
    email: 'smriti.kc@saffronstone.np',
    plan: 'Growth',
    planLabel: 'Plan',
    price: 'Rs. 4,500/mo',
    payment: 'Paid',
    created: 'Dec 19, 2024',
    region: 'Nagarkot',
  },
  {
    id: 4,
    name: 'Thamel Bites Corner',
    slug: 'thamel-bites-corner',
    company: 'Thamel Bites Pvt. Ltd.',
    status: 'Pending',
    owner: 'Ram Bahadur',
    email: 'ram@thamelbites.com',
    plan: 'Basic',
    planLabel: 'Plan',
    price: 'Rs. 1,500/mo',
    payment: 'Pending',
    created: 'Feb 02, 2025',
    region: 'Kathmandu',
  },
  {
    id: 5,
    name: 'Chitwan Jungle Kitchen',
    slug: 'chitwan-jungle-kitchen',
    company: 'Jungle Group',
    status: 'Paused',
    owner: 'Sita Gurung',
    email: 'sita@junglekitchen.np',
    plan: 'Growth',
    planLabel: 'Plan',
    price: 'Rs. 4,500/mo',
    payment: 'Overdue',
    created: 'Aug 15, 2024',
    region: 'Chitwan',
  },
];

// ─── Helpers ───────────────────────────────────────
const STATUS_STYLES: Record<RestaurantStatus, string> = {
  Active: 'text-green-700 bg-green-50 border-green-200',
  Pending: 'text-orange-700 bg-orange-50 border-orange-200',
  Paused: 'text-red-700 bg-red-50 border-red-200',
  Archived: 'text-purple-700 bg-purple-50 border-purple-200',
};

const PLAN_STYLES: Record<PlanTier, string> = {
  Basic: 'text-gray-700 bg-gray-50 border-gray-200',
  Growth: 'text-orange-700 bg-orange-50 border-orange-200',
  Enterprise: 'text-blue-700 bg-blue-50 border-blue-200',
};

const PAYMENT_STYLES: Record<string, string> = {
  Paid: 'text-green-700 bg-green-50 border-green-200',
  Pending: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  Overdue: 'text-red-700 bg-red-50 border-red-200',
};

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-teal-100 text-teal-700',
  'bg-pink-100 text-pink-700',
  'bg-indigo-100 text-indigo-700',
];

function getInitials(name: string) {
  return name
    .split(' ')
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export default function SuperAdminDashboard() {
  // ─── State ────────────────────────────────────
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | RestaurantStatus>('All');
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const [planFilter, setPlanFilter] = useState<'All' | PlanTier>('All');

  // ─── Computed: Filtered list ──────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ALL_RESTAURANTS.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q) && !r.owner.toLowerCase().includes(q)) {
        return false;
      }
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;
      if (regionFilter !== 'All' && r.region !== regionFilter) return false;
      if (planFilter !== 'All' && r.plan !== planFilter) return false;
      return true;
    });
  }, [search, statusFilter, regionFilter, planFilter]);

  // ─── Computed: Stats ──────────────────────────
  const stats = useMemo(() => {
    const total = ALL_RESTAURANTS.length;
    const active = ALL_RESTAURANTS.filter((r) => r.status === 'Active').length;
    const pending = ALL_RESTAURANTS.filter((r) => r.status === 'Pending').length;
    const paused = ALL_RESTAURANTS.filter((r) => r.status === 'Paused').length;
    const archived = ALL_RESTAURANTS.filter((r) => r.status === 'Archived').length;
    const activePercent = total ? ((active / total) * 100).toFixed(1) : '0.0';

    return { total, active, pending, paused, archived, activePercent };
  }, []);

  // ─── Computed: Filter options ─────────────────
  const regions = useMemo(
    () => ['All', ...Array.from(new Set(ALL_RESTAURANTS.map((r) => r.region)))],
    []
  );
  const plans = useMemo(() => ['All', 'Basic', 'Growth', 'Enterprise'] as const, []);
  const statuses = ['All', 'Active', 'Pending', 'Paused', 'Archived'] as const;

  const handleReset = () => {
    setSearch('');
    setStatusFilter('All');
    setRegionFilter('All');
    setPlanFilter('All');
  };

  const hasFilters =
    search !== '' ||
    statusFilter !== 'All' ||
    regionFilter !== 'All' ||
    planFilter !== 'All';

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1400px] mx-auto space-y-5">

            {/* ── Header ─────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Restaurants
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full border border-gray-200">
                    {stats.total} Total Nodes
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  All multi-tenant restaurant nodes across Nepal. Click any row to open details.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export CSV
                </button>
                <Link
                  href="/dashboard/superadmin/restaurants/add"
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-white bg-[#8B2E0F] hover:bg-[#6f2409] rounded-lg shadow-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Restaurant
                </Link>
              </div>
            </div>

            {/* ── Stats Cards (Dynamic) ───────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatBox
                label="Active Restaurants"
                value={stats.active}
                badge="LIVE"
                badgeColor="text-green-700 bg-green-50"
                footer={
                  <span className="text-green-700">
                    {stats.activePercent}% of Fleet
                  </span>
                }
                onClick={() => setStatusFilter('Active')}
              />
              <StatBox
                label="Waiting / Pending Onboarding"
                value={stats.pending}
                badge="INVITE"
                badgeColor="text-orange-700 bg-orange-50"
                footer={<span className="text-orange-600">Avg. 4.2d wait</span>}
                onClick={() => setStatusFilter('Pending')}
              />
              <StatBox
                label="Paused / Suspended"
                value={stats.paused}
                badge="BILLING LOCK"
                badgeColor="text-red-700 bg-red-50"
                footer={
                  stats.paused > 0 ? (
                    <span className="text-red-600 font-semibold">Immediate Action</span>
                  ) : (
                    <span className="text-gray-500">All clear</span>
                  )
                }
                onClick={() => setStatusFilter('Paused')}
              />
              <StatBox
                label="Closed / Archived"
                value={stats.archived}
                badge="COLD VAULT"
                badgeColor="text-purple-700 bg-purple-50"
                footer={<span className="text-gray-500">Retention 90d</span>}
                onClick={() => setStatusFilter('Archived')}
              />
            </div>

            {/* ── Filters Bar ─────────────────────── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by restaurant or owner…"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                />
              </div>

              <FilterSelect
                label="Status"
                value={statusFilter}
                options={statuses}
                onChange={(v) => setStatusFilter(v as typeof statusFilter)}
              />
              <FilterSelect
                label="Region"
                value={regionFilter}
                options={regions}
                onChange={setRegionFilter}
              />
              <FilterSelect
                label="Plan"
                value={planFilter}
                options={plans}
                onChange={(v) => setPlanFilter(v as typeof planFilter)}
              />

              {hasFilters && (
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear
                </button>
              )}
            </div>

            {/* ── Info bar ────────────────────────── */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-gray-500">
                <span className="w-4 h-4 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-[10px] font-bold">i</span>
                Showing <span className="font-bold text-gray-700">{filtered.length}</span> of{' '}
                <span className="font-bold text-gray-700">{stats.total}</span> restaurants
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-gray-500">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                LIVE SYNC: 4s
              </div>
            </div>

            {/* ── Table (Dynamic) ─────────────────── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {[
                        'Restaurant Name & Slug',
                        'Company',
                        'Status',
                        'Owner Contact',
                        'SaaS Subscription / Plan',
                        'Created Date',
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-16 text-center">
                          <div className="inline-flex flex-col items-center">
                            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                              <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">
                              No restaurants found
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Try adjusting your search or filters
                            </p>
                            {hasFilters && (
                              <button
                                onClick={handleReset}
                                className="mt-4 text-xs font-medium text-[#8B2E0F] hover:underline"
                              >
                                Clear all filters
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((r, i) => (
                        <tr
                          key={r.id}
                          className="hover:bg-orange-50/40 transition-colors cursor-pointer group"
                        >
                          <td className="px-5 py-4">
                            <Link
                              href={`/dashboard/superadmin/restaurants/${r.slug}`}
                              className="flex items-center gap-3"
                            >
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                                  AVATAR_COLORS[i % AVATAR_COLORS.length]
                                }`}
                              >
                                {getInitials(r.name)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 group-hover:text-[#8B2E0F] transition-colors">
                                  {r.name}
                                </p>
                                <p className="text-[11px] text-gray-400 font-mono truncate">
                                  {r.slug}
                                </p>
                              </div>
                            </Link>
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-700">
                            {r.company}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold border rounded-full ${
                                STATUS_STYLES[r.status]
                              }`}
                            >
                              <span className="w-1.5 h-1.5 bg-current rounded-full" />
                              {r.status.toUpperCase()}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-gray-900">
                              {r.owner}
                            </p>
                            <p className="text-[11px] text-blue-600 truncate">
                              {r.email}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`px-2 py-1 text-[10px] font-bold border rounded uppercase ${
                                  PLAN_STYLES[r.plan]
                                }`}
                              >
                                {r.plan}
                              </span>
                              <span className="text-xs text-gray-700 font-semibold">
                                {r.price}
                              </span>
                              <span
                                className={`px-2 py-0.5 text-[10px] font-bold border rounded ${
                                  PAYMENT_STYLES[r.payment]
                                }`}
                              >
                                {r.payment}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                            {r.created}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────
function StatBox({
  label,
  value,
  badge,
  badgeColor,
  footer,
  onClick,
}: {
  label: string;
  value: number | string;
  badge: string;
  badgeColor: string;
  footer?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md hover:border-orange-200 transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-xs font-medium text-gray-600 leading-tight">{label}</p>
        <span
          className={`px-2 py-0.5 text-[10px] font-bold rounded whitespace-nowrap ${badgeColor}`}
        >
          {badge}
        </span>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      {footer && <div className="text-[11px]">{footer}</div>}
    </button>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3.5 pr-9 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {label}: {opt}
          </option>
        ))}
      </select>
      <svg
        className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}