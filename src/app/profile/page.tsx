'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { showToast } from '@/components/ui/Toast';
import {
  User,
  Mail,
  Phone,
  Camera,
  Database,
  Save,
  CheckCircle
} from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) {
      showToast('Nama lengkap tidak boleh kosong', 'warning');
      return;
    }

    try {
      setSaving(true);
      const res = await db.auth.updateProfile({
        full_name: fullName,
        phone: phone || undefined,
        avatar_url: avatarUrl || undefined
      });
      if (res.error) throw res.error;
      showToast('Profil berhasil diperbarui!', 'success');
      refreshProfile();
    } catch (err: any) {
      showToast('Gagal memperbarui profil: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = () => {
    const seed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
    setAvatarUrl(newAvatar);
    showToast('Foto profil baru di-generate! Tekan Simpan untuk menerapkan.', 'info');
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Profil Pengguna
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Kelola detail kontak pribadi dan preferensi akun CareerCompass Anda.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* Avatar & Storage info Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col items-center text-center space-y-6">
            <div className="relative group">
              <img
                src={avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=User'}
                alt="Profile Photo"
                className="w-32 h-32 rounded-full object-cover ring-4 ring-slate-100 dark:ring-slate-800 transition"
              />
              <button
                type="button"
                onClick={handleAvatarChange}
                className="absolute bottom-0 right-0 p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-500/20 active:scale-95 transition"
                title="Generate Avatar Baru"
              >
                <Camera className="w-4.5 h-4.5" />
              </button>
            </div>

            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-lg">{user.full_name}</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{user.email}</p>
            </div>

            {/* Connection status */}
            <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-400">Database Engine</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold ${
                  db.isMock
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                }`}>
                  <Database className="w-3.5 h-3.5" />
                  <span>{db.isMock ? 'Demo Mode (LocalStorage)' : 'Supabase PostgreSQL'}</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-400">Status Akun</span>
                <span className="inline-flex items-center gap-1 text-emerald-500 font-bold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Terverifikasi</span>
                </span>
              </div>
            </div>
          </div>

          {/* Form edit fields Card */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base mb-6">Informasi Personal</h3>
            
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nama Lengkap *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700 text-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address (Read-only)</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-slate-800/20 border border-slate-200/60 dark:border-slate-800 text-sm rounded-2xl text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nomor Telepon</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="Contoh: 08123456789"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700 text-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 active:scale-[0.98] transition disabled:opacity-50"
              >
                <Save className="w-4.5 h-4.5" />
                <span>{saving ? 'Menyimpan Perubahan...' : 'Simpan Profil'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
