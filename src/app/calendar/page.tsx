'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { db, Interview } from '@/lib/db';
import { showToast } from '@/components/ui/Toast';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Info,
  CalendarDays
} from 'lucide-react';
import { generateGoogleCalendarUrl } from '@/lib/calendarHelper';

export default function CalendarPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  // Month navigation state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayInterviews, setSelectedDayInterviews] = useState<Interview[]>([]);
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');
  
  const agendaRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        const res = await db.interviews.list();
        if (res.error) throw res.error;
        setInterviews(res.data || []);
      } catch (err: any) {
        showToast('Gagal memuat jadwal interview: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday = 0, Monday = 1, etc.
  // Shift index so Monday is first day of the week
  const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const prevMonthDays = new Date(year, month, 0).getDate();

  // Create list of days to display in the grid
  const daysArray: { dayNum: number; isCurrentMonth: boolean; date: Date }[] = [];

  // Previous month trailing days
  for (let i = startOffset - 1; i >= 0; i--) {
    const dNum = prevMonthDays - i;
    daysArray.push({
      dayNum: dNum,
      isCurrentMonth: false,
      date: new Date(year, month - 1, dNum)
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push({
      dayNum: i,
      isCurrentMonth: true,
      date: new Date(year, month, i)
    });
  }

  // Next month leading days to complete grid (multiples of 7, let's say 42 cells)
  const remainingCells = 42 - daysArray.length;
  for (let i = 1; i <= remainingCells; i++) {
    daysArray.push({
      dayNum: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i)
    });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayInterviews([]);
    setSelectedDateStr('');
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayInterviews([]);
    setSelectedDateStr('');
  };

  // Find interviews scheduled for a specific date
  const getInterviewsForDate = (date: Date) => {
    return interviews.filter((int) => {
      const intDate = new Date(int.interview_date);
      return (
        intDate.getDate() === date.getDate() &&
        intDate.getMonth() === date.getMonth() &&
        intDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const handleDayClick = (date: Date, dayInterviews: Interview[]) => {
    setSelectedDayInterviews(dayInterviews);
    setSelectedDateStr(date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    
    // Auto scroll to details panel on mobile devices
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        agendaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  // List of upcoming interviews
  const upcomingInterviews = interviews
    .filter(i => new Date(i.interview_date).getTime() > Date.now())
    .sort((a, b) => new Date(a.interview_date).getTime() - new Date(b.interview_date).getTime());

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Kalender Interview
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Pantau dan persiapkan sesi wawancara mendatang Anda dengan agenda bulanan terstruktur.
          </p>
        </div>

        {/* Main Grid: Calendar & Details panel */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Calendar Box */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm">
            {/* Calendar Header Nav */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-extrabold text-slate-800 dark:text-white text-lg">
                {monthNames[month]} {year}
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 rounded-xl transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setCurrentDate(new Date());
                    setSelectedDayInterviews([]);
                    setSelectedDateStr('');
                  }}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  Hari Ini
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 rounded-xl transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 text-center font-bold text-[10px] sm:text-xs text-slate-400 mb-2">
              <div><span className="hidden sm:inline">SEN</span><span className="sm:hidden">S</span></div>
              <div><span className="hidden sm:inline">SEL</span><span className="sm:hidden">S</span></div>
              <div><span className="hidden sm:inline">RAB</span><span className="sm:hidden">R</span></div>
              <div><span className="hidden sm:inline">KAM</span><span className="sm:hidden">K</span></div>
              <div><span className="hidden sm:inline">JUM</span><span className="sm:hidden">J</span></div>
              <div><span className="hidden sm:inline">SAB</span><span className="sm:hidden">S</span></div>
              <div><span className="hidden sm:inline">MIN</span><span className="sm:hidden">M</span></div>
            </div>

            {/* Calendar Day Grid */}
            <div className="grid grid-cols-7 gap-1 border-t border-slate-100 dark:border-slate-800 pt-2">
              {daysArray.map((cell, idx) => {
                const dayInterviews = getInterviewsForDate(cell.date);
                const hasInterviews = dayInterviews.length > 0;
                
                const isToday =
                  cell.date.getDate() === new Date().getDate() &&
                  cell.date.getMonth() === new Date().getMonth() &&
                  cell.date.getFullYear() === new Date().getFullYear();

                return (
                  <div
                    key={idx}
                    onClick={() => handleDayClick(cell.date, dayInterviews)}
                    className={`min-h-[52px] md:min-h-[90px] p-1 md:p-2 rounded-2xl flex flex-col justify-between cursor-pointer transition ${
                      cell.isCurrentMonth
                        ? 'bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-800/10 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-200'
                        : 'bg-transparent text-slate-300 dark:text-slate-600'
                    } ${isToday ? 'ring-2 ring-blue-600 dark:ring-blue-500' : ''}`}
                  >
                    <span className={`text-xs font-bold self-end ${isToday ? 'text-blue-600 dark:text-blue-500' : ''}`}>
                      {cell.dayNum}
                    </span>

                    {/* Interview indicators */}
                    {hasInterviews && (
                      <div className="space-y-1 mt-auto">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full md:hidden self-center mx-auto" />
                        <div className="hidden md:flex flex-col gap-0.5 max-w-full">
                          {dayInterviews.slice(0, 2).map((int) => (
                            <div
                              key={int.id}
                              className="text-[9px] font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100/50 dark:border-amber-900/30 px-1.5 py-0.5 rounded truncate"
                            >
                              {int.application?.company?.name || 'Interview'}
                            </div>
                          ))}
                          {dayInterviews.length > 2 && (
                            <span className="text-[8px] text-slate-400 text-center font-semibold">+{dayInterviews.length - 2} lagi</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details & Agenda column */}
          <div className="space-y-6">
            {/* Selected day agenda */}
            <div ref={agendaRef} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm scroll-mt-24">
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base mb-4 flex items-center gap-2">
                <Info className="w-4.5 h-4.5 text-blue-600" />
                <span>Detail Agenda Hari</span>
              </h3>

              {selectedDateStr ? (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2 uppercase">
                    {selectedDateStr}
                  </p>
                  
                  {selectedDayInterviews.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDayInterviews.map((int) => (
                        <div
                          key={int.id}
                          className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-2"
                        >
                          <div className="flex justify-between items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-full">
                              {int.type}
                            </span>
                            <div className="flex items-center gap-3">
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
                                className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 font-semibold transition"
                                title="Tambahkan ke Google Kalender"
                              >
                                <Calendar className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600" />
                                <span>Kalender</span>
                              </a>
                              <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{new Date(int.interview_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                              </span>
                            </div>
                          </div>

                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                            {int.application?.position}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {int.application?.company?.name}
                          </p>

                          {int.location_link && (
                            <a
                              href={int.location_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 font-semibold pt-1 border-t border-slate-100 dark:border-slate-800"
                            >
                              <span>Buka Tautan Google Meet / Zoom</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {int.notes && (
                            <p className="text-xs text-slate-400/80 bg-slate-100/50 dark:bg-slate-800/40 p-2 rounded-lg italic">
                              Catatan: {int.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Tidak ada jadwal wawancara terdaftar pada hari ini.</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Pilih salah satu tanggal pada grid kalender di samping untuk melihat rincian agenda interview.
                </p>
              )}
            </div>

            {/* List of upcoming interviews */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm">
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base mb-4 flex items-center gap-2">
                <CalendarDays className="w-4.5 h-4.5 text-amber-500" />
                <span>Seluruh Wawancara Mendatang</span>
              </h3>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {upcomingInterviews.length > 0 ? (
                  upcomingInterviews.map((int) => (
                    <div
                      key={int.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1.5"
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-amber-600 dark:text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded">
                          {int.type}
                        </span>
                        <span className="text-slate-400">{new Date(int.interview_date).toLocaleDateString('id-ID', { dateStyle: 'short' })}</span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                        {int.application?.position}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">{int.application?.company?.name}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500">Belum ada agenda wawancara yang dijadwalkan.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
