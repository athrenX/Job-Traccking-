'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { db } from '@/lib/db';
import { Compass, Loader2, BarChart2, Calendar, ShieldCheck, FileText, Sun, Moon } from 'lucide-react';

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Gagal login menggunakan akun Google. Silakan coba lagi.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Decorative subtle background shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 dark:bg-emerald-600/10 rounded-full blur-3xl" />

        {/* Info Column */}
        <div className="space-y-6 relative z-10 hidden md:block pr-6 border-r border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/30">
              <Compass className="w-8 h-8 animate-spin-slow" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
              CareerCompass
            </span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white leading-tight">
            Sistem Manajemen Lamaran Kerja & Magang
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Kelola seluruh recruitment pipeline Anda dari satu dashboard terpusat. Solusi modern untuk pencarian karir yang terorganisir.
          </p>

          <div className="space-y-4 pt-4">
            <div className="flex gap-4">
              <div className="p-2 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-xl h-10 w-10 flex items-center justify-center shrink-0">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">Statistik Pelacakan</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Analisis tingkat kesuksesan, penawaran, dan penolakan Anda secara visual.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="p-2 bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded-xl h-10 w-10 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">Jadwal Kalender Terintegrasi</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Pantau dan kelola jadwal wawancara agar tidak terlewat.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="p-2 bg-amber-50 dark:bg-slate-800 text-amber-600 dark:text-amber-400 rounded-xl h-10 w-10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">Manajemen Dokumen</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Simpan CV, cover letter, dan sertifikat pendukung Anda di satu tempat aman.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Column */}
        <div className="flex flex-col justify-center space-y-8 p-4 relative z-10">
          {/* Mobile view branding */}
          <div className="md:hidden flex flex-col items-center space-y-4 text-center">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/30">
              <Compass className="w-8 h-8" />
            </div>
            <span className="text-2xl font-black text-slate-800 dark:text-white">CareerCompass</span>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Manajemen Lamaran Kerja & Magang</h2>
          </div>

          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Selamat Datang</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Masuk menggunakan Akun Google Anda untuk mulai melacak lamaran Anda.</p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl text-rose-600 dark:text-rose-400 text-sm flex gap-2">
              <ShieldCheck className="w-5 h-5 shrink-0 rotate-180" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl">
            <div className="flex items-center gap-3">
              <Moon className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-500 fill-blue-500/20' : 'text-slate-400'}`} />
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Mode Gelap</span>
            </div>
            <button
              onClick={toggleTheme}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 relative ${theme === 'dark' ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 group active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.14 2.78-1.4 3.62v3.01h2.24c5.06-4.66 7.97-11.53 7.97-18.48z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.87-3.01c-1.08.72-2.47 1.16-4.09 1.16-3.15 0-5.81-2.13-6.76-5.01H1.17v3.11c2 3.97 6.1 6.66 10.83 6.66z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.24 14.24a7.21 7.21 0 0 1 0-4.48V6.65H1.17a11.96 11.96 0 0 0 0 10.7l4.07-3.11z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.27 0 3.17 2.69 1.17 6.65L5.24 9.76c.95-2.88 3.61-5.01 6.76-5.01z"
                />
              </svg>
            )}
            <span>Masuk dengan Google (Gmail)</span>
          </button>

          {/* Portfolio Note */}
          <div className="text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {db.isMock ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full font-medium">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                  Mode Demo Aktif: Langsung Masuk
                </span>
              ) : (
                "Terhubung dengan Layanan Integrasi Database Supabase"
              )}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
