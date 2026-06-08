/**
 * Helper to generate Google Calendar template URLs for interviews.
 */
export interface GoogleCalendarEventInput {
  position: string;
  company_name: string;
  interview_date: string;
  type: string;
  location_link?: string;
  notes?: string;
}

export function generateGoogleCalendarUrl(interview: GoogleCalendarEventInput): string {
  const title = encodeURIComponent(`[Interview] ${interview.company_name} - ${interview.position} (${interview.type})`);
  
  // Parse interview date.
  const startDate = new Date(interview.interview_date);
  
  // Set duration to 1 hour by default.
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  
  // Format date to UTC YYYYMMDDTHHmmssZ format.
  const formatUTC = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const dates = `${formatUTC(startDate)}/${formatUTC(endDate)}`;
  
  // Construct description/details.
  const detailsParts = [
    `Posisi: ${interview.position}`,
    `Perusahaan: ${interview.company_name}`,
    `Tipe Wawancara: ${interview.type}`,
  ];
  if (interview.location_link) {
    detailsParts.push(`Tautan Rapat: ${interview.location_link}`);
  }
  if (interview.notes) {
    detailsParts.push(`Catatan: ${interview.notes}`);
  }
  
  const details = encodeURIComponent(detailsParts.join('\n'));
  const location = encodeURIComponent(interview.location_link || interview.type);
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}
