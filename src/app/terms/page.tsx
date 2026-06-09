'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Scale, Shield, Users, Info } from 'lucide-react';

export default function TermsPage() {
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
            <Scale className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              Syarat dan Ketentuan Layanan
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Aturan, syarat, dan ketentuan penggunaan aplikasi pelacak lamaran CareerCompass.
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 sm:p-10 shadow-sm border border-slate-100 dark:border-slate-700/50 space-y-8">
          
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              1. Penerimaan Ketentuan
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
              Dengan mengakses dan menggunakan **CareerCompass**, Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui untuk terikat dengan Syarat dan Ketentuan Layanan ini. Jika Anda tidak menyetujui salah satu bagian dari ketentuan ini, Anda tidak diperkenankan menggunakan layanan kami.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              2. Akun dan Keamanan Pengguna
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
              Untuk menggunakan beberapa fitur utama (seperti sinkronisasi data dengan Supabase dan Google Calendar), Anda diharuskan untuk masuk menggunakan akun Google Anda. Anda bertanggung jawab penuh atas:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm text-slate-600 dark:text-slate-300">
              <li>Menjaga keamanan dan kerahasiaan akses akun Anda.</li>
              <li>Segala aktivitas yang terjadi di bawah akun Anda.</li>
              <li>Memberikan informasi yang akurat dan benar pada profil Anda.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              3. Penggunaan yang Diperbolehkan
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
              Anda setuju untuk menggunakan CareerCompass hanya untuk keperluan pelacakan lamaran kerja pribadi secara sah. Anda dilarang untuk:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm text-slate-600 dark:text-slate-300">
              <li>Menggunakan layanan untuk tujuan penipuan atau aktivitas ilegal lainnya.</li>
              <li>Mengunggah berkas yang mengandung virus, malware, atau kode berbahaya lainnya.</li>
              <li>Mencoba merusak, melumpuhkan, atau membebani infrastruktur server CareerCompass (Supabase & Vercel).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
              4. Batasan Tanggung Jawab
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
              Layanan disediakan "apa adanya" (as-is) tanpa jaminan dalam bentuk apa pun. Kami tidak bertanggung jawab atas kerugian finansial, kegagalan lamaran kerja, kehilangan data, atau kendala teknis pihak ketiga (termasuk kegagalan sinkronisasi Google Calendar) yang timbul dari penggunaan atau ketidakmampuan menggunakan aplikasi ini.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
              5. Perubahan Ketentuan
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
              Kami berhak untuk memperbarui atau mengubah Syarat dan Ketentuan ini kapan saja tanpa pemberitahuan sebelumnya. Perubahan akan berlaku segera setelah dipublikasikan di halaman ini. Penggunaan berkelanjutan Anda atas layanan kami setelah perubahan tersebut menandakan persetujuan Anda terhadap ketentuan yang baru.
            </p>
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
