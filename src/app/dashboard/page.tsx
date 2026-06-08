'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { db, Application, Interview, RecruitmentLog } from '@/lib/db';
import { showToast } from '@/components/ui/Toast';
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  CalendarDays,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { generateGoogleCalendarUrl } from '@/lib/calendarHelper';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

export default function DashboardPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [logs, setLogs] = useState<RecruitmentLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [appsRes, intRes] = await Promise.all([
          db.applications.list(),
          db.interviews.list()
        ]);

        if (appsRes.error) throw appsRes.error;
        if (intRes.error) throw intRes.error;

        setApps(appsRes.data || []);
        setInterviews(intRes.data || []);

        // Fetch logs for the first 3 applications to simulate recent activity
        const recentLogs: RecruitmentLog[] = [];
        if (appsRes.data && appsRes.data.length > 0) {
          const logPromises = appsRes.data.slice(0, 3).map(a => db.logs.list(a.id));
          const logResults = await Promise.all(logPromises);
          logResults.forEach(res => {
            if (res.data) recentLogs.push(...res.data);
          });
        }
        
        // Sort logs by date descending
        recentLogs.sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime());
        setLogs(recentLogs.slice(0, 4));

      } catch (err: any) {
        showToast('Gagal memuat data dashboard: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute metrics
  const totalApps = apps.length;
  const interviewing = apps.filter(a => ['Interview', 'HR Interview'].includes(a.status)).length;
  const accepted = apps.filter(a => ['Accepted', 'Offered'].includes(a.status)).length;
  const rejected = apps.filter(a => a.status === 'Rejected').length;
  const processing = totalApps - accepted - rejected;

  const COLORS = {
    Applied: '#2563EB', // Blue
    Screening: '#8B5CF6', // Purple
    'Technical Test': '#EC4899', // Pink
    Interview: '#F59E0B', // Yellow
    'HR Interview': '#D97706', // Dark Yellow
    Offered: '#10B981', // Green
    Accepted: '#059669', // Emerald
    Rejected: '#EF4444', // Red
  };

  // Chart data
  const statusCounts = apps.reduce((acc: Record<string, number>, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(statusCounts).map(([status, value]) => ({
    name: status,
    value,
    fill: COLORS[status as keyof typeof COLORS] || '#94A3B8'
  }));

  // Upcoming interviews filter
  const upcomingInterviews = interviews
    .filter(i => new Date(i.interview_date).getTime() > Date.now())
    .sort((a, b) => new Date(a.interview_date).getTime() - new Date(b.interview_date).getTime())
    .slice(0, 3);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8 animate-pulse">
          <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
            <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
              Ringkasan Karir
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Selamat datang kembali! Berikut status pencarian kerja Anda saat ini.
            </p>
          </div>
          <Link
            href="/applications?action=new"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25 transition duration-200 active:scale-[0.98] self-start"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Lamaran</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full group-hover:scale-110 transition duration-300" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Lamaran</span>
              <div className="p-2 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-slate-800 dark:text-white">{totalApps}</span>
              <p className="text-xs text-slate-400 mt-1">Seluruh lamaran terdaftar</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition">
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-bl-full group-hover:scale-110 transition duration-300" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Sedang Diproses</span>
              <div className="p-2 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-lg">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-slate-800 dark:text-white">{processing}</span>
              <p className="text-xs text-slate-400 mt-1">Menunggu kabar & review</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-bl-full group-hover:scale-110 transition duration-300" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Interview</span>
              <div className="p-2 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-lg">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-slate-800 dark:text-white">{interviewing}</span>
              <p className="text-xs text-slate-400 mt-1">Tahap interview aktif</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full group-hover:scale-110 transition duration-300" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Diterima</span>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-slate-800 dark:text-white">{accepted}</span>
              <p className="text-xs text-slate-400 mt-1">Penawaran & diterima</p>
            </div>
          </div>

          {/* Card 5 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition">
            <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-bl-full group-hover:scale-110 transition duration-300" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Ditolak</span>
              <div className="p-2 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-slate-800 dark:text-white">{rejected}</span>
              <p className="text-xs text-slate-400 mt-1">Lamaran ditolak perusahaan</p>
            </div>
          </div>
        </div>

        {/* Charts & Details Section */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Chart Card */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 dark:text-white">Status Lamaran Kerja</h3>
              </div>
            </div>
            <div className="h-64 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
                  Belum ada statistik. Tambahkan lamaran pertama Anda!
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Interview Alerts */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm flex flex-col">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              <span>Interview Terdekat</span>
            </h3>
            <div className="flex-1 space-y-4">
              {upcomingInterviews.length > 0 ? (
                upcomingInterviews.map((int) => (
                  <div
                    key={int.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col gap-2 hover:border-slate-200 dark:hover:border-slate-700 transition"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-full">
                        {int.type}
                      </span>
                      <div className="flex items-center gap-2">
                        <a
                          href={generateGoogleCalendarUrl({
                            position: int.application?.position || '',
                            company_name: int.application?.company?.name || '',
                            interview_date: int.interview_date,
                            type: int.type,
                            location_link: int.location_link,
                            notes: int.notes
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-slate-500 hover:text-blue-600 flex items-center gap-1 font-semibold transition"
                          title="Tambahkan ke Google Kalender"
                        >
                          <Calendar className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600" />
                          <span>Kalender</span>
                        </a>
                        {int.location_link && (
                          <a
                            href={int.location_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 font-semibold"
                          >
                            <span>Meet</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">
                      {int.application?.position}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {int.application?.company?.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-1">
                      <CalendarDays className="w-3.5 h-3.5" />
                      <span>{new Date(int.interview_date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
                  <Calendar className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs font-medium">Tidak ada interview dalam waktu dekat.</p>
                </div>
              )}
            </div>
            <Link
              href="/calendar"
              className="mt-4 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1"
            >
              <span>Buka Kalender Selengkapnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6">Aktivitas Rekrutmen Terbaru</h3>
          <div className="relative border-l border-slate-200 dark:border-slate-800 pl-6 space-y-6">
            {logs.length > 0 ? (
              logs.map((log) => {
                const app = apps.find(a => a.id === log.application_id);
                return (
                  <div key={log.id} className="relative group">
                    {/* Timeline dot */}
                    <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-4 border-white dark:border-slate-900 ring-4 ring-blue-500/10 group-hover:scale-125 transition duration-200" />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                          {app?.position} - <span className="text-blue-600 dark:text-blue-400">{app?.company?.name}</span>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{log.notes}</p>
                      </div>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        {new Date(log.logged_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500 pl-2">Belum ada log aktivitas terbaru.</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
