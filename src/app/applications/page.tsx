'use client';

import React, { useEffect, useState, Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { db, Application, Company, Interview, Document, RecruitmentLog } from '@/lib/db';
import { showToast } from '@/components/ui/Toast';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Edit2,
  Trash2,
  Star,
  ExternalLink,
  MapPin,
  Calendar,
  X,
  FileText,
  Upload,
  CalendarPlus,
  Sparkles,
  Download,
  AlertTriangle,
  History,
  TrendingUp,
  Coins,
  Briefcase
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { generateGoogleCalendarUrl } from '@/lib/calendarHelper';

function ApplicationsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Core States
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Detail Drawer / Panel State
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [appLogs, setAppLogs] = useState<RecruitmentLog[]>([]);
  const [appDocs, setAppDocs] = useState<Document[]>([]);
  const [appInterviews, setAppInterviews] = useState<Interview[]>([]);

  // Add/Edit Modals States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editId, setEditId] = useState<string | null>(null);
  
  // Form Fields
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [jobType, setJobType] = useState<Application['job_type']>('Full Time');
  const [location, setLocation] = useState('');
  const [appliedDate, setAppliedDate] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [jobLink, setJobLink] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Application['status']>('Applied');
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formFileType, setFormFileType] = useState<'CV' | 'Cover Letter' | 'Certificate'>('CV');

  // New Interview Form fields inside Detail Drawer
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewType, setInterviewType] = useState('Technical Interview');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [interviewLink, setInterviewLink] = useState('');
  const [isAddingInterview, setIsAddingInterview] = useState(false);

  // File Upload states
  const [uploadType, setUploadType] = useState<'CV' | 'Cover Letter' | 'Certificate'>('CV');
  const [uploadingFile, setUploadingFile] = useState(false);

  // AI Assistant states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiActionType, setAiActionType] = useState<'cover-letter' | 'interview' | null>(null);
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([]);
  const [chatInput, setChatInput] = useState('');

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await db.applications.list();
      if (res.error) throw res.error;
      setApps(res.data || []);
    } catch (err: any) {
      showToast('Gagal memuat lamaran: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (searchParams.get('action') === 'new') {
      openCreateModal();
    }
  }, [searchParams]);

  // Open detail panel helper
  const handleViewDetails = async (app: Application) => {
    setSelectedApp(app);
    setAiMessages([]);
    setChatInput('');
    setAiActionType(null);
    setAiLoading(false);
    try {
      const [logsRes, docsRes, intRes] = await Promise.all([
        db.logs.list(app.id),
        db.documents.list(app.id),
        db.interviews.list()
      ]);
      setAppLogs(logsRes.data || []);
      setAppDocs(docsRes.data || []);
      setAppInterviews((intRes.data || []).filter((i: Interview) => i.application_id === app.id));
    } catch (err: any) {
      showToast('Gagal memuat rincian lamaran: ' + err.message, 'error');
    }
  };

  const formatRupiah = (value: string) => {
    const cleanNumber = value.replace(/\D/g, '');
    if (!cleanNumber) return '';
    return 'Rp ' + new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Number(cleanNumber));
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSalaryRange(formatRupiah(e.target.value));
  };

  // Add application helper
  const openCreateModal = () => {
    setFormMode('create');
    setCompanyName('');
    setPosition('');
    setJobType('Full Time');
    setLocation('');
    setAppliedDate(new Date().toISOString().split('T')[0]);
    setSalaryRange('');
    setJobLink('');
    setNotes('');
    setStatus('Applied');
    setFormFile(null);
    setFormFileType('CV');
    setIsFormOpen(true);
  };

  const openEditModal = (app: Application) => {
    setFormMode('edit');
    setEditId(app.id);
    setCompanyName(app.company?.name || '');
    setPosition(app.position);
    setJobType(app.job_type);
    setLocation(app.location);
    setAppliedDate(app.applied_date);
    setSalaryRange(app.salary_range || '');
    setJobLink(app.job_link || '');
    setNotes(app.notes || '');
    setStatus(app.status);
    setFormFile(null);
    setFormFileType('CV');
    setIsFormOpen(true);
  };

  const handleSaveApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !position || !location || !appliedDate) {
      showToast('Silakan isi seluruh kolom bertanda *', 'warning');
      return;
    }

    try {
      if (formMode === 'create') {
        const res = await db.applications.create({
          company_id: '',
          position,
          job_type: jobType,
          location,
          applied_date: appliedDate,
          salary_range: salaryRange || undefined,
          job_link: jobLink || undefined,
          notes: notes || undefined,
          status
        }, companyName);
        if (res.error) throw res.error;

        if (formFile && res.data) {
          const docRes = await db.documents.upload(res.data.id, formFileType, formFile);
          if (docRes.error) throw docRes.error;
        }

        showToast('Lamaran baru berhasil ditambahkan!', 'success');
      } else if (formMode === 'edit' && editId) {
        const res = await db.applications.update(editId, {
          position,
          job_type: jobType,
          location,
          applied_date: appliedDate,
          salary_range: salaryRange || undefined,
          job_link: jobLink || undefined,
          notes: notes || undefined,
          status
        }, companyName);
        if (res.error) throw res.error;

        if (formFile) {
          const docRes = await db.documents.upload(editId, formFileType, formFile);
          if (docRes.error) throw docRes.error;
        }

        showToast('Lamaran berhasil diperbarui!', 'success');
        if (selectedApp && selectedApp.id === editId) {
          // Refresh details if currently open
          const updated = await db.applications.getById(editId);
          if (updated.data) handleViewDetails(updated.data);
        }
      }
      setIsFormOpen(false);
      fetchData();
      router.replace('/applications');
    } catch (err: any) {
      showToast('Gagal menyimpan lamaran: ' + err.message, 'error');
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus lamaran ini? Seluruh riwayat dan dokumen terkait akan ikut terhapus.')) return;
    try {
      const res = await db.applications.delete(id);
      if (res.error) throw res.error;
      showToast('Lamaran berhasil dihapus.', 'success');
      if (selectedApp?.id === id) setSelectedApp(null);
      fetchData();
    } catch (err: any) {
      showToast('Gagal menghapus lamaran: ' + err.message, 'error');
    }
  };

  const handleQuickStatusChange = async (newStatus: Application['status']) => {
    if (!selectedApp) return;
    try {
      const res = await db.applications.update(selectedApp.id, { status: newStatus });
      if (res.error) throw res.error;
      showToast('Status lamaran berhasil diperbarui!', 'success');
      fetchData();
      const updated = await db.applications.getById(selectedApp.id);
      if (updated.data) handleViewDetails(updated.data);
    } catch (err: any) {
      showToast('Gagal memperbarui status: ' + err.message, 'error');
    }
  };

  const handleToggleFavorite = async (companyId: string, currentFav: boolean) => {
    try {
      const res = await db.companies.toggleFavorite(companyId, !currentFav);
      if (res.error) throw res.error;
      showToast(currentFav ? 'Dihapus dari perusahaan favorit.' : 'Ditambahkan ke perusahaan favorit!', 'success');
      fetchData();
      if (selectedApp && selectedApp.company_id === companyId) {
        setSelectedApp(prev => prev ? {
          ...prev,
          company: prev.company ? { ...prev.company, is_favorite: !currentFav } : undefined
        } : null);
      }
    } catch (err: any) {
      showToast('Gagal mengubah status favorit: ' + err.message, 'error');
    }
  };

  // Interview Creation Helper inside Detail Drawer
  const handleAddInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !interviewDate || !interviewType) {
      showToast('Silakan isi kolom tanggal dan jenis interview', 'warning');
      return;
    }

    try {
      const res = await db.interviews.create({
        application_id: selectedApp.id,
        interview_date: new Date(interviewDate).toISOString(),
        type: interviewType,
        notes: interviewNotes || undefined,
        location_link: interviewLink || undefined
      });
      if (res.error) throw res.error;
      showToast('Jadwal interview baru berhasil disimpan!', 'success');
      setInterviewDate('');
      setInterviewNotes('');
      setInterviewLink('');
      setIsAddingInterview(false);
      
      // Update local state
      const intRes = await db.interviews.list();
      setAppInterviews((intRes.data || []).filter((i: Interview) => i.application_id === selectedApp.id));
    } catch (err: any) {
      showToast('Gagal menambahkan interview: ' + err.message, 'error');
    }
  };

  const handleDeleteInterview = async (id: string) => {
    if (!confirm('Hapus jadwal interview ini?')) return;
    try {
      const res = await db.interviews.delete(id);
      if (res.error) throw res.error;
      showToast('Jadwal interview dihapus.', 'success');
      setAppInterviews(prev => prev.filter(i => i.id !== id));
    } catch (err: any) {
      showToast('Gagal menghapus interview: ' + err.message, 'error');
    }
  };

  // Document Upload Helper
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedApp) return;

    // Size limit check (5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showToast('File terlalu besar! Maksimal ukuran file adalah 5 MB.', 'warning');
      return;
    }

    try {
      setUploadingFile(true);
      const res = await db.documents.upload(selectedApp.id, uploadType, file);
      if (res.error) throw res.error;
      showToast(`${uploadType} berhasil diunggah!`, 'success');
      
      // Refresh documents
      const docsRes = await db.documents.list(selectedApp.id);
      setAppDocs(docsRes.data || []);
    } catch (err: any) {
      showToast('Gagal mengunggah dokumen: ' + err.message, 'error');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteDoc = async (id: string, path: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) return;
    try {
      const res = await db.documents.delete(id, path);
      if (res.error) throw res.error;
      showToast('Dokumen berhasil dihapus.', 'success');
      setAppDocs(prev => prev.filter(d => d.id !== id));
    } catch (err: any) {
      showToast('Gagal menghapus dokumen: ' + err.message, 'error');
    }
  };

  // AI Assistant Helper
  const parseBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ')) {
        return <h4 key={lineIdx} className="font-extrabold text-xs text-slate-800 dark:text-white mt-3 mb-1.5">{parseBold(trimmed.substring(4))}</h4>;
      }
      if (trimmed.startsWith('## ')) {
        return <h3 key={lineIdx} className="font-black text-sm text-slate-900 dark:text-white mt-4 mb-2 border-b border-slate-200/40 dark:border-slate-800 pb-1">{parseBold(trimmed.substring(3))}</h3>;
      }
      if (trimmed.startsWith('# ')) {
        return <h2 key={lineIdx} className="font-black text-base text-slate-900 dark:text-white mt-5 mb-2.5">{parseBold(trimmed.substring(2))}</h2>;
      }
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        return (
          <li key={lineIdx} className="list-disc list-inside ml-2 my-1 text-[11px] text-slate-700 dark:text-slate-350">
            {parseBold(trimmed.substring(2))}
          </li>
        );
      }
      const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        return (
          <div key={lineIdx} className="ml-1 my-1 text-[11px] font-semibold text-slate-800 dark:text-slate-200">
            {numMatch[1]}. {parseBold(numMatch[2])}
          </div>
        );
      }
      if (trimmed === '') {
        return <div key={lineIdx} className="h-1.5" />;
      }
      return (
        <p key={lineIdx} className="my-1 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          {parseBold(line)}
        </p>
      );
    });
  };

  const handleGenerateAIContent = async (action: 'cover-letter' | 'interview') => {
    if (!selectedApp) return;
    try {
      setAiLoading(true);
      setAiActionType(action);
      setAiMessages([]);
      
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: selectedApp.company?.name || 'Perusahaan',
          position: selectedApp.position,
          notes: selectedApp.notes || '',
          action,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat menghubungi Gemini API');
      }

      setAiMessages([
        { role: 'model', text: data.result }
      ]);
    } catch (err: any) {
      showToast('AI Gagal: ' + err.message, 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !chatInput.trim() || aiLoading) return;
    
    const userMsg = chatInput;
    setChatInput('');
    
    const updatedMessages = [...aiMessages, { role: 'user' as const, text: userMsg }];
    setAiMessages(updatedMessages);
    
    try {
      setAiLoading(true);
      const formattedHistory = updatedMessages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));
      
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: selectedApp.company?.name || 'Perusahaan',
          position: selectedApp.position,
          notes: selectedApp.notes || '',
          action: 'chat',
          history: formattedHistory.slice(0, -1),
          message: userMsg
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat menghubungi Gemini API');
      }

      setAiMessages([...updatedMessages, { role: 'model', text: data.result }]);
    } catch (err: any) {
      showToast('AI Gagal: ' + err.message, 'error');
    } finally {
      setAiLoading(false);
    }
  };

  // Export PDF Utility
  const handleExportPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('CareerCompass – Laporan Lamaran Kerja & Magang', 14, 22);
      
      doc.setFontSize(10);
      doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 28);
      
      const tableData = filteredApps.map((a, i) => [
        i + 1,
        a.company?.name || '-',
        a.position,
        a.job_type,
        a.location,
        a.applied_date,
        a.status
      ]);

      autoTable(doc, {
        head: [['No', 'Perusahaan', 'Posisi', 'Jenis', 'Lokasi', 'Tanggal Melamar', 'Status']],
        body: tableData,
        startY: 34,
        theme: 'striped',
        styles: { fontSize: 9 }
      });

      doc.save('CareerCompass-Applications-Report.pdf');
      showToast('Laporan PDF berhasil diunduh!', 'success');
    } catch (err) {
      showToast('Gagal mengekspor data ke PDF.', 'error');
    }
  };

  // Export Excel Utility
  const handleExportExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      
      const sheetData = filteredApps.map(a => ({
        Perusahaan: a.company?.name || '-',
        Posisi: a.position,
        'Jenis Pekerjaan': a.job_type,
        Lokasi: a.location,
        'Tanggal Melamar': a.applied_date,
        Gaji: a.salary_range || '-',
        'Link Lowongan': a.job_link || '-',
        Status: a.status,
        Catatan: a.notes || '-'
      }));

      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Lamaran');
      XLSX.writeFile(workbook, 'CareerCompass-Applications-Export.xlsx');
      showToast('Data Excel berhasil diunduh!', 'success');
    } catch (err) {
      showToast('Gagal mengekspor data ke Excel.', 'error');
    }
  };

  // Filter application list
  const filteredApps = apps
    .filter(app => {
      const matchSearch =
        app.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.company?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'All' || app.status === statusFilter;
      const matchType = typeFilter === 'All' || app.job_type === typeFilter;
      const matchFavorite = !favoriteOnly || app.company?.is_favorite;

      return matchSearch && matchStatus && matchType && matchFavorite;
    })
    .sort((a, b) => {
      const dateA = new Date(a.applied_date).getTime();
      const dateB = new Date(b.applied_date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  // Badge Status colors mapping
  const getStatusBadge = (status: Application['status']) => {
    const colorMap = {
      Applied: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30',
      Screening: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30',
      'Technical Test': 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border-pink-100 dark:border-pink-900/30',
      Interview: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30',
      'HR Interview': 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900/30',
      Offered: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30',
      Accepted: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900/30',
      Rejected: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30',
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${colorMap[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 relative">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
              Lamaran Kerja & Magang
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Catat, kelola status, dan simpan dokumen seluruh proses recruitment Anda.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Export Dropdown buttons */}
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
            >
              <Download className="w-4 h-4 text-rose-500" />
              <span>PDF</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
            >
              <Download className="w-4 h-4 text-emerald-500" />
              <span>Excel</span>
            </button>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition duration-200 active:scale-[0.98]"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Tambah Lamaran</span>
            </button>
          </div>
        </div>

        {/* Filters drawer / bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-3xl shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari perusahaan atau posisi jabatan..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-800 dark:text-white"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-800 dark:text-white appearance-none"
              >
                <option value="All">Semua Status</option>
                <option value="Applied">Applied</option>
                <option value="Screening">Screening</option>
                <option value="Technical Test">Technical Test</option>
                <option value="Interview">Interview</option>
                <option value="HR Interview">HR Interview</option>
                <option value="Offered">Offered</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Job Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-800 dark:text-white"
              >
                <option value="All">Semua Jenis Pekerjaan</option>
                <option value="Full Time">Full Time</option>
                <option value="Internship">Internship</option>
                <option value="Part Time">Part Time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-4">
              {/* Toggle Favorite */}
              <button
                onClick={() => setFavoriteOnly(!favoriteOnly)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                  favoriteOnly
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                    : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${favoriteOnly ? 'fill-amber-500 text-amber-500' : ''}`} />
                <span>Perusahaan Favorit</span>
              </button>
            </div>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Urutkan: {sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}</span>
            </button>
          </div>
        </div>

        {/* Listing Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
            ))}
          </div>
        ) : filteredApps.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map((app) => (
              <div
                key={app.id}
                onClick={() => handleViewDetails(app)}
                className={`bg-white dark:bg-slate-900 border ${
                  selectedApp?.id === app.id
                    ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/10'
                    : 'border-slate-200/60 dark:border-slate-800/80'
                } p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md cursor-pointer transition duration-300 relative group`}
              >
                <div className="space-y-4">
                  {/* Top line Info */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-extrabold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate text-base">
                        {app.position}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold truncate mt-0.5">
                        {app.company?.name}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Star Favorite icon */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(app.company_id, app.company?.is_favorite || false);
                        }}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-amber-500 transition"
                      >
                        <Star className={`w-4 h-4 ${app.company?.is_favorite ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Details badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
                      {app.job_type}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{app.location}</span>
                    </span>
                  </div>

                  {app.salary_range && (
                    <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/5 px-2.5 py-1 rounded-lg w-max">
                      <Coins className="w-3.5 h-3.5" />
                      <span>{app.salary_range}</span>
                    </div>
                  )}
                </div>

                {/* Footer metrics */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-5">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Melamar: {new Date(app.applied_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                  </div>
                  {getStatusBadge(app.status)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <Briefcase className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Tidak ada lamaran ditemukan</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mt-1">
              Cobalah untuk mengubah filter pencarian Anda atau tambah lamaran kerja pertama Anda hari ini!
            </p>
            <button
              onClick={openCreateModal}
              className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition"
            >
              Tambah Lamaran Pertama
            </button>
          </div>
        )}

        {/* Detailed Slider Panel / Modal Drawer when Application is selected */}
        {selectedApp && (
          <div className="fixed inset-0 z-40 flex justify-end">
            {/* Overlay backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setSelectedApp(null)}
            />

            {/* Slider container */}
            <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col z-50 border-l border-slate-200 dark:border-slate-800 animate-slide-left overflow-y-auto p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Star
                    onClick={() => handleToggleFavorite(selectedApp.company_id, selectedApp.company?.is_favorite || false)}
                    className={`w-5 h-5 cursor-pointer hover:scale-110 transition ${
                      selectedApp.company?.is_favorite ? 'fill-amber-500 text-amber-500' : 'text-slate-400'
                    }`}
                  />
                  <span className="text-sm font-bold text-slate-400 dark:text-slate-500">Rincian Lamaran</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(selectedApp)}
                    className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition"
                    title="Edit Lamaran"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteApplication(selectedApp.id)}
                    className="p-2 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-xl transition"
                    title="Hapus Lamaran"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Title Content */}
              <div className="space-y-4 mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                    {selectedApp.position}
                  </h2>
                  <p className="text-blue-600 dark:text-blue-400 font-extrabold text-base mt-1">
                    {selectedApp.company?.name}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative inline-block">
                    <select
                      value={selectedApp.status}
                      onChange={(e) => handleQuickStatusChange(e.target.value as any)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-full border cursor-pointer focus:outline-none appearance-none pr-7 transition-colors duration-200 ${
                        selectedApp.status === 'Applied' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30' :
                        selectedApp.status === 'Screening' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30' :
                        selectedApp.status === 'Technical Test' ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border-pink-100 dark:border-pink-900/30' :
                        selectedApp.status === 'Interview' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30' :
                        selectedApp.status === 'HR Interview' ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900/30' :
                        selectedApp.status === 'Offered' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' :
                        selectedApp.status === 'Accepted' ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900/30' :
                        'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30'
                      }`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%233B82F6' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                        backgroundPosition: 'right 0.35rem center',
                        backgroundSize: '1.25em 1.25em',
                        backgroundRepeat: 'no-repeat'
                      }}
                    >
                      <option value="Applied">Applied (Dilamar)</option>
                      <option value="Screening">Screening (Seleksi Berkas)</option>
                      <option value="Technical Test">Technical Test (Tes Teknis)</option>
                      <option value="Interview">Interview (Wawancara)</option>
                      <option value="HR Interview">HR Interview (Wawancara HR)</option>
                      <option value="Offered">Offered (Penawaran)</option>
                      <option value="Accepted">Accepted (Diterima)</option>
                      <option value="Rejected">Rejected (Ditolak)</option>
                    </select>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{selectedApp.location} ({selectedApp.job_type})</span>
                  </span>
                  {selectedApp.job_link && (
                    <a
                      href={selectedApp.job_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Lowongan</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {selectedApp.salary_range && (
                  <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 px-3 py-1.5 rounded-xl w-max">
                    Kisaran Gaji: {selectedApp.salary_range}
                  </div>
                )}

                {selectedApp.notes && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm text-slate-600 dark:text-slate-300">
                    <h5 className="font-bold text-xs text-slate-400 mb-1">CATATAN / NOTES</h5>
                    <p className="whitespace-pre-line">{selectedApp.notes}</p>
                  </div>
                )}
              </div>

              {/* Recruitment Timeline Log section */}
              <div className="space-y-4 mb-8">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <History className="w-4.5 h-4.5 text-blue-600" />
                  <span>Timeline Rekrutmen</span>
                </h3>
                <div className="relative pl-6 border-l border-slate-200 dark:border-slate-800 space-y-4 py-2">
                  {appLogs.map((log) => (
                    <div key={log.id} className="relative group">
                      <div className="absolute -left-[31px] top-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900" />
                      <div className="text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{log.status}</span>
                        <p className="text-slate-400 dark:text-slate-500 mt-0.5">{log.notes}</p>
                        <span className="text-[10px] text-slate-400/80">{new Date(log.logged_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Document Manager */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <FileText className="w-4.5 h-4.5 text-emerald-500" />
                    <span>CV & Dokumen Pendukung</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold bg-slate-50 dark:bg-slate-800/40 px-2 py-0.5 rounded-md">Maks 5 MB</span>
                </div>
                
                {/* Upload Form */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <select
                      value={uploadType}
                      onChange={e => setUploadType(e.target.value as any)}
                      className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                    >
                      <option value="CV">CV (PDF)</option>
                      <option value="Cover Letter">Cover Letter</option>
                      <option value="Certificate">Sertifikat</option>
                    </select>

                    <label className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition">
                      {uploadingFile ? (
                        <span>Mengunggah...</span>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Unggah File</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        disabled={uploadingFile}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-[10px] text-amber-600 dark:text-amber-500 font-medium flex items-center gap-1">
                    ⚠️ Ukuran file maksimal adalah 5 MB (.pdf, .doc, .docx)
                  </p>
                </div>

                {/* Uploaded Documents List */}
                <div className="space-y-2">
                  {appDocs.length > 0 ? (
                    appDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{doc.file_name}</p>
                            <span className="text-[10px] text-slate-400">{doc.document_type}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <a
                            href={doc.file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500"
                            title="Buka Dokumen"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleDeleteDoc(doc.id, doc.file_path)}
                            className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded-lg text-rose-500"
                            title="Hapus Dokumen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500">Belum ada CV/dokumen yang diunggah. Maks 5MB.</p>
                  )}
                </div>
              </div>

              {/* Interview Management */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <CalendarPlus className="w-4.5 h-4.5 text-amber-500" />
                    <span>Jadwal Interview</span>
                  </h3>
                  <button
                    onClick={() => setIsAddingInterview(!isAddingInterview)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                  >
                    {isAddingInterview ? 'Batal' : '+ Jadwal'}
                  </button>
                </div>

                {isAddingInterview && (
                  <form onSubmit={handleAddInterview} className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">TANGGAL & WAKTU *</label>
                        <input
                          type="datetime-local"
                          value={interviewDate}
                          onChange={e => setInterviewDate(e.target.value)}
                          required
                          className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">TAHAPAN / JENIS *</label>
                        <select
                          value={interviewType}
                          onChange={e => setInterviewType(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                        >
                          <option value="Technical Interview">Technical Interview</option>
                          <option value="HR Interview">HR Interview</option>
                          <option value="User Interview">User Interview</option>
                          <option value="Coding Test">Coding Test</option>
                          <option value="Behavioral Interview">Behavioral Interview</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">LINK MEETING / LOKASI (OPSIONAL)</label>
                      <input
                        type="url"
                        placeholder="https://meet.google.com/..."
                        value={interviewLink}
                        onChange={e => setInterviewLink(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">CATATAN / PERSIAPAN (OPSIONAL)</label>
                      <textarea
                        rows={2}
                        placeholder="Catatan persiapan materi..."
                        value={interviewNotes}
                        onChange={e => setInterviewNotes(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/10 transition"
                    >
                      Simpan Jadwal Interview
                    </button>
                  </form>
                )}

                {/* Interviews List */}
                <div className="space-y-3">
                  {appInterviews.length > 0 ? (
                    appInterviews.map((int) => (
                      <div
                        key={int.id}
                        className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between items-start gap-4"
                      >
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{int.type}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(int.interview_date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-1">
                            <a
                              href={generateGoogleCalendarUrl({
                                position: selectedApp.position,
                                company_name: selectedApp.company?.name || '',
                                interview_date: int.interview_date,
                                type: int.type,
                                location_link: int.location_link,
                                notes: int.notes
                              })}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-500 hover:text-blue-600 flex items-center gap-1 font-semibold transition"
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
                                className="text-blue-500 hover:underline flex items-center gap-1 font-semibold"
                              >
                                <span>Tautan Rapat</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          {int.notes && (
                            <p className="text-slate-400 dark:text-slate-500 mt-1 italic">Note: {int.notes}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteInterview(int.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500">Belum ada agenda interview yang dijadwalkan.</p>
                  )}
                </div>
              </div>

              {/* AI Assistant Section */}
              <div className="space-y-4 mb-8 pt-6 border-t border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4.5 h-4.5 text-blue-500 animate-pulse" />
                    <span>AI Assistant (Gemini)</span>
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGenerateAIContent('cover-letter')}
                    disabled={aiLoading}
                    className="flex-1 py-2 px-3 bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Buat Cover Letter</span>
                  </button>

                  <button
                    onClick={() => handleGenerateAIContent('interview')}
                    disabled={aiLoading || ['Offered', 'Accepted', 'Rejected'].includes(selectedApp.status)}
                    className="flex-1 py-2 px-3 bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={['Offered', 'Accepted', 'Rejected'].includes(selectedApp.status) ? "Interview telah selesai dilewati" : ""}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{['Offered', 'Accepted', 'Rejected'].includes(selectedApp.status) ? 'Interview Selesai' : 'Persiapan Interview'}</span>
                  </button>
                </div>

                {/* Chat Stream */}
                {aiMessages.length > 0 && (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/20">
                    {aiMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col gap-1 max-w-[85%] ${
                          msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                        }`}
                      >
                        <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
                          {msg.role === 'user' ? 'Anda' : 'AI Assistant'}
                        </span>
                        <div
                          className={`p-3.5 rounded-2xl text-xs shadow-xs relative group ${
                            msg.role === 'user'
                              ? 'bg-blue-600 text-white rounded-tr-none'
                              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-350 border border-slate-200/50 dark:border-slate-800/80 rounded-tl-none'
                          }`}
                        >
                          {msg.role === 'user' ? (
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                          ) : (
                            <div className="space-y-1 font-sans">
                              {renderMarkdown(msg.text)}
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(msg.text);
                                  showToast('Berhasil disalin ke clipboard!', 'success');
                                }}
                                className="mt-2 text-[9px] text-blue-600 dark:text-blue-400 hover:underline font-bold block"
                              >
                                Salin Jawaban
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* AI Loading state */}
                {aiLoading && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-2.5 py-6">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Memproses respon AI...</p>
                  </div>
                )}

                {/* Chat Input for Interactivity */}
                {aiMessages.length > 0 && (
                  <form onSubmit={handleSendChatMessage} className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Tanyakan lebih lanjut ke AI..."
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      disabled={aiLoading}
                      className="flex-1 px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={aiLoading || !chatInput.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Kirim
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Global Add/Edit Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setIsFormOpen(false)}
            />
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl z-50 relative overflow-hidden p-6 md:p-8 animate-scale-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <span>{formMode === 'create' ? 'Tambah Lamaran Baru' : 'Edit Detail Lamaran'}</span>
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveApplication} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">NAMA PERUSAHAAN *</label>
                    <input
                      type="text"
                      placeholder="Contoh: Google Indonesia"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">POSISI / JABATAN *</label>
                    <input
                      type="text"
                      placeholder="Contoh: Mobile Engineer Intern"
                      value={position}
                      onChange={e => setPosition(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">JENIS PEKERJAAN *</label>
                    <select
                      value={jobType}
                      onChange={e => setJobType(e.target.value as any)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                    >
                      <option value="Full Time">Full Time</option>
                      <option value="Internship">Internship</option>
                      <option value="Part Time">Part Time</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">LOKASI *</label>
                    <input
                      type="text"
                      placeholder="Contoh: Jakarta (Hybrid) / Remote"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">TANGGAL MELAMAR *</label>
                    <input
                      type="date"
                      value={appliedDate}
                      onChange={e => setAppliedDate(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">STATUS LAMARAN *</label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as any)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                    >
                      <option value="Applied">Applied</option>
                      <option value="Screening">Screening</option>
                      <option value="Technical Test">Technical Test</option>
                      <option value="Interview">Interview</option>
                      <option value="HR Interview">HR Interview</option>
                      <option value="Offered">Offered</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">ESTIMASI GAJI (OPSIONAL)</label>
                    <input
                      type="text"
                      placeholder="Contoh: Rp 8.000.000"
                      value={salaryRange}
                      onChange={handleSalaryChange}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">LINK LOWONGAN (OPSIONAL)</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={jobLink}
                      onChange={e => setJobLink(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-end">
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">JENIS DOKUMEN</label>
                    <select
                      value={formFileType}
                      onChange={e => setFormFileType(e.target.value as any)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                    >
                      <option value="CV">CV (PDF)</option>
                      <option value="Cover Letter">Cover Letter</option>
                      <option value="Certificate">Sertifikat</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">UNGGAH DOKUMEN</label>
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold cursor-pointer transition text-slate-500 dark:text-slate-400 truncate">
                      <Upload className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="truncate">{formFile ? formFile.name : 'Pilih file PDF/Word...'}</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              showToast('File terlalu besar! Maksimal 5 MB.', 'warning');
                              return;
                            }
                            setFormFile(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 block font-medium">
                      ⚠️ Ukuran file maksimal adalah 5 MB (.pdf, .doc, .docx)
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">CATATAN PENDUKUNG (OPSIONAL)</label>
                  <textarea
                    rows={3}
                    placeholder="Materi yang ditanyakan, persiapan interview, detail rekrutmen..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-500/15 transition active:scale-[0.98]"
                  >
                    Simpan Lamaran
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Memuat tracker lamaran...</p>
        </div>
      </div>
    }>
      <ApplicationsPageContent />
    </Suspense>
  );
}
