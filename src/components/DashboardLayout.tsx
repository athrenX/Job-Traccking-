'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Compass,
  LayoutDashboard,
  Briefcase,
  Calendar,
  BarChart3,
  User,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Lamaran Saya', path: '/applications', icon: Briefcase },
    { name: 'Kalender Interview', path: '/calendar', icon: Calendar },
    { name: 'Statistik & Analisis', path: '/analytics', icon: BarChart3 },
    { name: 'Profil Pengguna', path: '/profile', icon: User },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Compass className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Memuat data CareerCompass...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800/60 shrink-0 relative z-20">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-100 dark:border-slate-800/60">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-500/20">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
            CareerCompass
          </span>
        </div>

        {/* User Card */}
        <div className="px-6 py-5 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/60">
          <img
            src={user.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg?seed=User'}
            alt="Avatar"
            className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
              {user.full_name}
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
              {user.email}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center justify-between px-4 py-3.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-white" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/60 space-y-2">
          {/* Theme switch */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-slate-600 dark:text-slate-400 text-sm hover:text-slate-900 dark:hover:text-white transition duration-200"
          >
            <div className="flex items-center gap-3">
              {theme === 'light' ? (
                <>
                  <Moon className="w-5 h-5 text-slate-400" />
                  <span>Mode Gelap</span>
                </>
              ) : (
                <>
                  <Sun className="w-5 h-5 text-yellow-500" />
                  <span>Mode Terang</span>
                </>
              )}
            </div>
            <div className={`w-9 h-5 bg-slate-200 dark:bg-slate-700 rounded-full p-0.5 transition-colors duration-200 relative`}>
              <div className={`w-4 h-4 bg-white dark:bg-slate-300 rounded-full transition-transform duration-200 ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </button>

          {/* Logout button */}
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/5 hover:text-red-600 font-medium text-sm transition duration-200"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="relative flex flex-col w-80 max-w-xs bg-white dark:bg-slate-900 h-full shadow-2xl p-6 border-r border-slate-200 dark:border-slate-800 animate-slide-right">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Compass className="w-6 h-6 text-blue-600 animate-spin-slow" />
                <span className="text-lg font-black dark:text-white">CareerCompass</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile info in drawer */}
            <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
              <img
                src={user.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg?seed=User'}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {user.full_name}
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
              </div>
            </div>

            <nav className="flex-1 space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-slate-600 dark:text-slate-400 text-sm"
              >
                <div className="flex items-center gap-3">
                  {theme === 'light' ? (
                    <>
                      <Moon className="w-5 h-5 text-slate-400" />
                      <span>Mode Gelap</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-5 h-5 text-yellow-500" />
                      <span>Mode Terang</span>
                    </>
                  )}
                </div>
              </button>

              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-semibold text-sm hover:bg-red-500/5 rounded-xl"
              >
                <LogOut className="w-5 h-5" />
                <span>Keluar</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Compass className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-bold dark:text-white">CareerCompass</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
