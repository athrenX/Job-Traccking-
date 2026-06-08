'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { db, Application } from '@/lib/db';
import { showToast } from '@/components/ui/Toast';
import {
  BarChart3,
  TrendingUp,
  Award,
  AlertTriangle,
  PieChart,
  Calendar,
  Briefcase
} from 'lucide-react';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  AreaChart,
  Area,
  PieChart as PieChartRecharts,
  Pie
} from 'recharts';

export default function AnalyticsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const res = await db.applications.list();
        if (res.error) throw res.error;
        setApps(res.data || []);
      } catch (err: any) {
        showToast('Gagal memuat data statistik: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);

  // 1. Math calculations
  const totalApps = apps.length;
  const acceptedApps = apps.filter(a => a.status === 'Accepted').length;
  const offeredApps = apps.filter(a => a.status === 'Offered').length;
  const rejectedApps = apps.filter(a => a.status === 'Rejected').length;
  const interviewingApps = apps.filter(a => ['Interview', 'HR Interview'].includes(a.status)).length;
  const activeProcess = totalApps - acceptedApps - rejectedApps;

  const acceptanceRate = totalApps > 0 ? Math.round(((acceptedApps + offeredApps) / totalApps) * 100) : 0;
  const rejectionRate = totalApps > 0 ? Math.round((rejectedApps / totalApps) * 100) : 0;

  // 2. Apps by Status (for Bar Chart)
  const statusCounts = apps.reduce((acc: Record<string, number>, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  // Colors mapping for charts
  const COLORS = {
    Applied: '#2563EB',
    Screening: '#8B5CF6',
    'Technical Test': '#EC4899',
    Interview: '#F59E0B',
    'HR Interview': '#D97706',
    Offered: '#10B981',
    Accepted: '#059669',
    Rejected: '#EF4444'
  };

  const statusChartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    Jumlah: count,
    fill: COLORS[status as keyof typeof COLORS] || '#94A3B8'
  }));

  // 3. Apps by Job Type (for Pie Chart)
  const typeCounts = apps.reduce((acc: Record<string, number>, app) => {
    acc[app.job_type] = (acc[app.job_type] || 0) + 1;
    return acc;
  }, {});

  const typeChartData = Object.entries(typeCounts).map(([type, count]) => ({
    name: type,
    value: count
  }));

  const TYPE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  // 4. Apps by Month (Timeline Area Chart)
  // Get counts for the last 6 months
  const getMonthlyTimelineData = () => {
    const monthlyData: Record<string, number> = {};
    const now = new Date();
    
    // Initialize last 6 months with 0
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('id-ID', { month: 'short', year: 'numeric' });
      monthlyData[label] = 0;
    }

    apps.forEach(app => {
      const appDate = new Date(app.applied_date);
      const label = appDate.toLocaleString('id-ID', { month: 'short', year: 'numeric' });
      if (label in monthlyData) {
        monthlyData[label]++;
      }
    });

    return Object.entries(monthlyData).map(([month, count]) => ({
      Bulan: month,
      Lamaran: count
    }));
  };

  const monthlyChartData = getMonthlyTimelineData();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8 animate-pulse">
          <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
            <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Statistik & Analisis
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Pantau persentase penawaran, tingkat penolakan, serta trend intensitas melamar kerja Anda.
          </p>
        </div>

        {/* Analytics Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Acceptance Rate */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-5 relative overflow-hidden group hover:shadow-md transition">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full group-hover:scale-110 transition duration-300" />
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tingkat Kesuksesan (Offer Rate)</span>
              <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">
                {acceptanceRate}%
              </h2>
              <p className="text-[11px] text-slate-400 mt-1">Persentase status Offered / Accepted</p>
            </div>
          </div>

          {/* Card 2: Rejection Rate */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-5 relative overflow-hidden group hover:shadow-md transition">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full group-hover:scale-110 transition duration-300" />
            <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-2xl">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tingkat Penolakan</span>
              <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">
                {rejectionRate}%
              </h2>
              <p className="text-[11px] text-slate-400 mt-1">Persentase status Rejected</p>
            </div>
          </div>

          {/* Card 3: Active Funnel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-5 relative overflow-hidden group hover:shadow-md transition">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full group-hover:scale-110 transition duration-300" />
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-2xl">
              <Briefcase className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Rasio Funnel Aktif</span>
              <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">
                {activeProcess} / {totalApps}
              </h2>
              <p className="text-[11px] text-slate-400 mt-1">Lamaran yang masih berjalan</p>
            </div>
          </div>
        </div>

        {/* Charts Middle Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Monthly area chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm">
            <h3 className="font-extrabold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Intensitas Melamar Per Bulan</span>
            </h3>
            <div className="h-64 w-full">
              {totalApps > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis 
                      dataKey="Bulan" 
                      stroke="currentColor" 
                      className="text-slate-400 dark:text-slate-500" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="currentColor" 
                      className="text-slate-400 dark:text-slate-500" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        color: 'hsl(var(--foreground))',
                      }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      labelStyle={{ color: 'hsl(var(--muted-foreground))', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="Lamaran" stroke="#2563EB" fillOpacity={0.1} fill="url(#colorLamaran)" />
                    <defs>
                      <linearGradient id="colorLamaran" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
                  Belum ada data bulanan.
                </div>
              )}
            </div>
          </div>

          {/* Job Type Pie chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm">
            <h3 className="font-extrabold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-emerald-500" />
              <span>Distribusi Jenis Pekerjaan</span>
            </h3>
            <div className="grid md:grid-cols-2 items-center gap-4 h-64">
              <div className="h-full w-full">
                {typeChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChartRecharts>
                      <Pie
                        data={typeChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {typeChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px',
                          color: 'hsl(var(--foreground))',
                        }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                    </PieChartRecharts>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
                    Belum ada data jenis pekerjaan.
                  </div>
                )}
              </div>

              {/* Legends list */}
              <div className="space-y-3">
                {typeChartData.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TYPE_COLORS[idx % TYPE_COLORS.length] }} />
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-white">
                      {item.value} ({Math.round((item.value / totalApps) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Status Bar Graph */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm">
          <h3 className="font-extrabold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-500" />
            <span>Sebaran Status Recruitment Lengkap</span>
          </h3>
          <div className="h-72 w-full">
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    stroke="currentColor" 
                    className="text-slate-400 dark:text-slate-500" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="currentColor" 
                    className="text-slate-400 dark:text-slate-500" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      color: 'hsl(var(--foreground))',
                    }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="Jumlah" radius={[6, 6, 0, 0]}>
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
                Belum ada data status.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
