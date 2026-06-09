'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Calendar, Lock, Database } from 'lucide-react';

export default function PrivacyPage() {
  const lastUpdated = '9 Juni 2026';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation & Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Login
          </Link>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Terakhir Diperbarui: {lastUpdated}
          </span>
        </div>

        {/* Hero Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700/50 mb-8 text-center sm:text-left sm:flex sm:items-center sm:gap-6">
          <div className="mx-auto sm:mx-0 w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mb-4 sm:mb-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              Kebijakan Privasi
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Bagaimana kami mengelola, menyimpan, dan melindungi informasi serta data integrasi Google Anda di CareerCompass.
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 sm:p-10 shadow-sm border border-slate-100 dark:border-slate-700/50 space-y-8">
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" />
              1. Informasi yang Kami Kumpulkan
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
              Kami mengumpulkan informasi yang diperlukan untuk mengelola pelacakan lamaran kerja Anda secara efektif. Informasi ini mencakup:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm text-slate-600 dark:text-slate-300">
              <li><strong>Informasi Akun:</strong> Nama lengkap, alamat email, dan foto profil yang diperoleh saat Anda melakukan pendaftaran atau login melalui layanan Google Sign-In.</li>
              <li><strong>Data Lamaran Kerja:</strong> Nama perusahaan, posisi/jabatan, status rekrutmen, rentang gaji, catatan, serta dokumen pendukung (CV, Cover Letter) yang Anda unggah secara sukarela.</li>
              <li><strong>Data Jadwal Wawancara:</strong> Waktu, tanggal, jenis wawancara, dan catatan terkait agenda rekrutmen Anda.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              2. Penggunaan Google Calendar API & Integrasi Google
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
              CareerCompass menyediakan fitur integrasi langsung dengan **Google Calendar API** untuk memudahkan sinkronisasi jadwal wawancara Anda:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm text-slate-600 dark:text-slate-300">
              <li><strong>Hak Akses (`calendar.events`):</strong> Aplikasi meminta izin untuk membuat, membaca, memperbarui, dan menghapus event kalender *hanya* pada kalender utama Anda yang berkaitan langsung dengan jadwal wawancara yang Anda masukkan di CareerCompass.</li>
              <li><strong>Tujuan Penggunaan:</strong> Akses ini digunakan secara eksklusif untuk menyinkronkan jadwal wawancara kerja yang Anda buat di CareerCompass ke Google Calendar pribadi Anda secara real-time, agar Anda tidak melewatkan sesi wawancara penting.</li>
              <li><strong>Penyimpanan Data Google:</strong> Kami tidak menyimpan salinan seluruh data kalender pribadi Anda di database kami. Kami hanya menyimpan ID event Google Calendar (`google_event_id`) untuk menghubungkan data wawancara di CareerCompass dengan event di Google Calendar Anda.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-500" />
              3. Penyimpanan & Keamanan Data
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
              Semua data Anda disimpan dengan aman menggunakan infrastruktur **Supabase** (terenkripsi) atau secara lokal pada browser Anda (**LocalStorage**) jika aplikasi berjalan dalam mode Demo/Mock. Kami tidak pernah membagikan, menyewakan, atau menjual informasi pribadi Anda kepada pihak ketiga mana pun untuk tujuan pemasaran.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
              4. Hak Pengguna & Penghapusan Data
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
              Anda memiliki kontrol penuh atas data Anda. Anda dapat memutuskan hubungan integrasi Google Anda atau menghapus akun dan seluruh data lamaran Anda kapan saja melalui halaman **Pengaturan Profil** di dalam aplikasi.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
              5. Hubungi Kami
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
              Jika Anda memiliki pertanyaan mengenai kebijakan privasi ini atau penggunaan data Google Anda di aplikasi ini, silakan hubungi tim pengembang kami di:
            </p>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 text-sm">
              <p className="font-medium text-slate-900 dark:text-white">CareerCompass Developer Team</p>
              <p className="text-blue-600 dark:text-blue-400">Email: madanisibertech@gmail.com</p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
          <p>© {new Date().getFullYear()} CareerCompass. Hak Cipta Dilindungi Undang-Undang.</p>
        </div>
      </div>
    </div>
  );
}
