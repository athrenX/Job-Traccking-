import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Google OAuth token.' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { action, eventId, position, companyName, interviewDate, type, locationLink, notes } = await request.json();

    if (!action) {
      return NextResponse.json({ error: 'Missing action parameter.' }, { status: 400 });
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    if (action === 'create') {
      const summary = `[Interview] ${companyName} - ${position} (${type})`;
      const startDate = new Date(interviewDate);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

      const detailsParts = [
        `Posisi: ${position}`,
        `Perusahaan: ${companyName}`,
        `Tipe Wawancara: ${type}`,
      ];
      if (locationLink) {
        detailsParts.push(`Tautan Rapat: ${locationLink}`);
      }
      if (notes) {
        detailsParts.push(`Catatan: ${notes}`);
      }

      const body = {
        summary,
        description: detailsParts.join('\n'),
        location: locationLink || type,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: 'UTC',
        },
      };

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json({ error: `Google API Error: ${errorText}` }, { status: response.status });
      }

      const data = await response.json();
      return NextResponse.json({ eventId: data.id });
    }

    if (action === 'update') {
      if (!eventId) {
        return NextResponse.json({ error: 'Missing eventId for update.' }, { status: 400 });
      }

      const summary = `[Interview] ${companyName} - ${position} (${type})`;
      const startDate = new Date(interviewDate);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

      const detailsParts = [
        `Posisi: ${position}`,
        `Perusahaan: ${companyName}`,
        `Tipe Wawancara: ${type}`,
      ];
      if (locationLink) {
        detailsParts.push(`Tautan Rapat: ${locationLink}`);
      }
      if (notes) {
        detailsParts.push(`Catatan: ${notes}`);
      }

      const body = {
        summary,
        description: detailsParts.join('\n'),
        location: locationLink || type,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: 'UTC',
        },
      };

      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json({ error: `Google API Error: ${errorText}` }, { status: response.status });
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      if (!eventId) {
        return NextResponse.json({ error: 'Missing eventId for deletion.' }, { status: 400 });
      }

      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'DELETE',
        headers,
      });

      // Google Calendar returns 204 No Content on successful deletion
      if (response.status !== 204 && !response.ok) {
        const errorText = await response.text();
        return NextResponse.json({ error: `Google API Error: ${errorText}` }, { status: response.status });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
