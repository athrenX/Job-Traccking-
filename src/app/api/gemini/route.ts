import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured.' },
        { status: 500 }
      );
    }

    const { companyName, position, notes, action, history, message } = await request.json();

    if (!companyName || !position || !action) {
      return NextResponse.json(
        { error: 'Missing required parameters: companyName, position, action.' },
        { status: 400 }
      );
    }

    // Build the contents array. If it's a follow-up chat, we construct the conversation history.
    let contents = [];

    if (action === 'chat' && history && history.length > 0) {
      contents = [...history];
      if (message) {
        contents.push({
          role: 'user',
          parts: [{ text: message }]
        });
      }
    } else {
      let prompt = '';
      if (action === 'cover-letter') {
        prompt = `Buatkan surat lamaran kerja (Cover Letter) yang profesional, persuasif, dan dipersonalisasi dalam Bahasa Indonesia untuk posisi "${position}" di perusahaan "${companyName}". ${
          notes ? `Gunakan catatan tambahan berikut sebagai konteks kualifikasi atau latar belakang: "${notes}". ` : ''
        }Format surat harus memiliki struktur yang rapi (Tanggal, Kepada Yth., Salam Pembuka, Paragraf Pembuka, Paragraf Isi/Kualifikasi, Paragraf Penutup, dan Salam Penutup). Tulis dengan gaya bahasa yang santun, profesional, dan tunjukkan antusiasme tinggi untuk posisi tersebut.`;
      } else if (action === 'interview') {
        prompt = `Berikan panduan persiapan interview untuk posisi "${position}" di perusahaan "${companyName}" dalam Bahasa Indonesia. 
Sajikan konten dalam format berikut:
1. **Prediksi Pertanyaan & Tips Menjawab**: Berikan 4-5 pertanyaan wawancara (perpaduan pertanyaan umum, perilaku/behavioral, dan teknis relevan) yang kemungkinan besar akan ditanyakan, beserta poin-poin tips ringkas cara menjawabnya secara efektif.
2. **Rekomendasi Persiapan**: Berikan 2-3 tips persiapan spesifik mengenai jenis industri atau keahlian yang perlu dipelajari untuk posisi ini.
Gunakan markdown yang rapi dengan heading, list, dan cetak tebal (bold) agar mudah dibaca oleh pelamar kerja.`;
      } else {
        return NextResponse.json(
          { error: 'Invalid action parameter. Must be "cover-letter", "interview", or "chat".' },
          { status: 400 }
        );
      }

      contents = [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ];
    }

    // Call Google Gemini API (using gemini-1.5-flash for reliability and lower latency)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return NextResponse.json({ result: generatedText });
  } catch (error: any) {
    console.error('Gemini API Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}
