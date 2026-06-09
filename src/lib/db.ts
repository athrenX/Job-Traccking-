import { createClient } from './supabase/client';

export interface Profile {
  id: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  email?: string;
}

export interface Company {
  id: string;
  name: string;
  is_favorite: boolean;
}

export interface Application {
  id: string;
  company_id: string;
  company?: Company;
  position: string;
  job_type: 'Full Time' | 'Internship' | 'Part Time' | 'Contract';
  location: string;
  applied_date: string;
  salary_range?: string;
  job_link?: string;
  notes?: string;
  status: 'Applied' | 'Screening' | 'Technical Test' | 'Interview' | 'HR Interview' | 'Offered' | 'Accepted' | 'Rejected';
  created_at?: string;
}

export interface Interview {
  id: string;
  application_id: string;
  application?: Application;
  interview_date: string;
  type: string;
  notes?: string;
  location_link?: string;
  google_event_id?: string;
}

export interface Document {
  id: string;
  application_id: string;
  document_type: 'CV' | 'Cover Letter' | 'Certificate';
  file_path: string;
  file_name: string;
  created_at: string;
}

export interface RecruitmentLog {
  id: string;
  application_id: string;
  status: string;
  notes: string;
  logged_at: string;
}

const isMockMode = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !url || url.includes('your-supabase') || url === '';
};

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

// --- MOCK STORAGE IMPLEMENTATION ---
const getLocalStorageData = <T>(key: string, defaultVal: T): T => {
  if (typeof window === 'undefined') return defaultVal;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultVal;
};

const setLocalStorageData = <T>(key: string, data: T) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

const mockInit = () => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem('cc_user')) {
    localStorage.setItem('cc_user', JSON.stringify({
      id: 'mock-user-123',
      email: 'john.doe@gmail.com',
      full_name: 'John Doe',
      phone: '081234567890',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    }));
  }
  if (!localStorage.getItem('cc_companies')) {
    localStorage.setItem('cc_companies', JSON.stringify([
      { id: 'c1', name: 'Google Indonesia', is_favorite: true },
      { id: 'c2', name: 'Gojek Tokopedia (GoTo)', is_favorite: true },
      { id: 'c3', name: 'Shopee', is_favorite: false },
      { id: 'c4', name: 'Traveloka', is_favorite: false }
    ]));
  }
  if (!localStorage.getItem('cc_applications')) {
    localStorage.setItem('cc_applications', JSON.stringify([
      {
        id: 'a1',
        company_id: 'c1',
        position: 'Software Engineer Intern',
        job_type: 'Internship',
        location: 'Jakarta (Hybrid)',
        applied_date: '2026-05-10',
        salary_range: 'Rp 8.000.000 - Rp 10.000.000',
        job_link: 'https://careers.google.com',
        notes: 'Fokus pada system design & algoritma.',
        status: 'Interview',
        created_at: new Date('2026-05-10T10:00:00Z').toISOString()
      },
      {
        id: 'a2',
        company_id: 'c2',
        position: 'Backend Engineer',
        job_type: 'Full Time',
        location: 'Jakarta (Onsite)',
        applied_date: '2026-05-15',
        salary_range: 'Rp 15.000.000 - Rp 20.000.000',
        job_link: 'https://careers.goto.com',
        notes: 'Interview HR tanggal 15 Juni.',
        status: 'HR Interview',
        created_at: new Date('2026-05-15T10:00:00Z').toISOString()
      },
      {
        id: 'a3',
        company_id: 'c3',
        position: 'Frontend Developer',
        job_type: 'Full Time',
        location: 'Singapore (Remote)',
        applied_date: '2026-05-01',
        salary_range: 'SGD 4,000 - 5,500',
        job_link: 'https://careers.shopee.sg',
        notes: 'Sudah technical test.',
        status: 'Technical Test',
        created_at: new Date('2026-05-01T10:00:00Z').toISOString()
      },
      {
        id: 'a4',
        company_id: 'c4',
        position: 'Mobile Engineer (iOS)',
        job_type: 'Contract',
        location: 'Jakarta',
        applied_date: '2026-04-20',
        salary_range: 'Rp 12.000.000',
        job_link: 'https://traveloka.com/careers',
        notes: 'Ditolak karena kurang pengalaman Swift UI.',
        status: 'Rejected',
        created_at: new Date('2026-04-20T10:00:00Z').toISOString()
      }
    ]));
  }
  if (!localStorage.getItem('cc_interviews')) {
    localStorage.setItem('cc_interviews', JSON.stringify([
      {
        id: 'i1',
        application_id: 'a1',
        interview_date: '2026-06-15T14:00:00.000Z',
        type: 'Technical Interview 1',
        notes: 'Review Data Structures & Algorithms.',
        location_link: 'https://meet.google.com/abc-defg-hij'
      },
      {
        id: 'i2',
        application_id: 'a2',
        interview_date: '2026-06-20T10:00:00.000Z',
        type: 'HR Interview',
        notes: 'Be prepared with behavioral questions.',
        location_link: 'https://zoom.us/j/123456789'
      }
    ]));
  }
  if (!localStorage.getItem('cc_logs')) {
    localStorage.setItem('cc_logs', JSON.stringify([
      { id: 'l1', application_id: 'a1', status: 'Applied', notes: 'Application created.', logged_at: '2026-05-10T10:00:00Z' },
      { id: 'l2', application_id: 'a1', status: 'Interview', notes: 'Status updated from Applied to Interview.', logged_at: '2026-05-20T14:30:00Z' },
      { id: 'l3', application_id: 'a2', status: 'Applied', notes: 'Application created.', logged_at: '2026-05-15T10:00:00Z' },
      { id: 'l4', application_id: 'a2', status: 'Screening', notes: 'Status updated from Applied to Screening.', logged_at: '2026-05-18T10:00:00Z' },
      { id: 'l5', application_id: 'a2', status: 'HR Interview', notes: 'Status updated from Screening to HR Interview.', logged_at: '2026-06-01T09:00:00Z' }
    ]));
  }
};

mockInit();

// --- DB ADAPTER INTERFACE ---
export const db = {
  isMock: isMockMode(),

  // Auth Operations
  auth: {
    async getUser() {
      if (isMockMode()) {
        const user = getLocalStorageData<any>('cc_user', null);
        return { data: { user }, error: null };
      }
      const supabase = createClient();
      return await supabase.auth.getUser();
    },

    async signInWithGoogle() {
      if (isMockMode()) {
        // Simulate google sign in by ensuring mock user is set
        mockInit();
        return { data: { provider: 'google', url: '/dashboard' }, error: null };
      }
      const supabase = createClient();
      return await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'https://www.googleapis.com/auth/calendar.events',
        },
      });
    },

    async signUp(email: string, name: string) {
      if (isMockMode()) {
        const newUser = {
          id: 'mock-user-' + Math.random().toString(36).substr(2, 9),
          email,
          full_name: name,
          phone: '',
          avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`
        };
        setLocalStorageData('cc_user', newUser);
        return { data: { user: newUser }, error: null };
      }
      const supabase = createClient();
      return await supabase.auth.signInWithOtp({ email });
    },

    async signOut() {
      if (isMockMode()) {
        localStorage.removeItem('cc_user');
        return { error: null };
      }
      const supabase = createClient();
      return await supabase.auth.signOut();
    },

    async getProfile() {
      if (isMockMode()) {
        const user = getLocalStorageData<any>('cc_user', null);
        return { data: user, error: null };
      }
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: new Error('Unauthorized') };
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data && !error) {
        data.email = user.email;
      }
      
      return { data, error };
    },

    async updateProfile(profile: Partial<Profile>) {
      if (isMockMode()) {
        const user = getLocalStorageData<any>('cc_user', {});
        const updated = { ...user, ...profile };
        setLocalStorageData('cc_user', updated);
        return { data: updated, error: null };
      }
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: new Error('Unauthorized') };

      const { data, error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', user.id)
        .select()
        .single();

      return { data, error };
    }
  },

  // Company Operations
  companies: {
    async list() {
      if (isMockMode()) {
        const companies = getLocalStorageData<Company[]>('cc_companies', []);
        return { data: companies, error: null };
      }
      const supabase = createClient();
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      return { data, error };
    },

    async create(name: string) {
      if (isMockMode()) {
        const companies = getLocalStorageData<Company[]>('cc_companies', []);
        const exists = companies.find(c => c.name.toLowerCase() === name.toLowerCase());
        if (exists) return { data: exists, error: null };

        const newCompany = {
          id: 'c-' + Math.random().toString(36).substr(2, 9),
          name,
          is_favorite: false
        };
        companies.push(newCompany);
        setLocalStorageData('cc_companies', companies);
        return { data: newCompany, error: null };
      }
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      // Check first
      const { data: existing } = await supabase
        .from('companies')
        .select('*')
        .eq('name', name)
        .eq('user_id', user?.id)
        .maybeSingle();

      if (existing) return { data: existing, error: null };

      const { data, error } = await supabase
        .from('companies')
        .insert({ name, user_id: user?.id })
        .select()
        .single();
      return { data, error };
    },

    async toggleFavorite(companyId: string, isFavorite: boolean) {
      if (isMockMode()) {
        const companies = getLocalStorageData<Company[]>('cc_companies', []);
        const updated = companies.map(c => c.id === companyId ? { ...c, is_favorite: isFavorite } : c);
        setLocalStorageData('cc_companies', updated);
        return { error: null };
      }
      const supabase = createClient();
      const { error } = await supabase
        .from('companies')
        .update({ is_favorite: isFavorite })
        .eq('id', companyId);
      return { error };
    }
  },

  // Application Operations
  applications: {
    async list() {
      if (isMockMode()) {
        const apps = getLocalStorageData<Application[]>('cc_applications', []);
        const companies = getLocalStorageData<Company[]>('cc_companies', []);
        const populated = apps.map(app => ({
          ...app,
          company: companies.find(c => c.id === app.company_id)
        })).sort((a, b) => new Date(b.applied_date).getTime() - new Date(a.applied_date).getTime());
        return { data: populated, error: null };
      }
      const supabase = createClient();
      const { data, error } = await supabase
        .from('applications')
        .select('*, company:companies(*)')
        .order('applied_date', { ascending: false });
      return { data, error };
    },

    async getById(id: string) {
      if (isMockMode()) {
        const apps = getLocalStorageData<Application[]>('cc_applications', []);
        const companies = getLocalStorageData<Company[]>('cc_companies', []);
        const app = apps.find(a => a.id === id);
        if (!app) return { data: null, error: new Error('Not found') };
        return {
          data: {
            ...app,
            company: companies.find(c => c.id === app.company_id)
          },
          error: null
        };
      }
      const supabase = createClient();
      const { data, error } = await supabase
        .from('applications')
        .select('*, company:companies(*)')
        .eq('id', id)
        .single();
      return { data, error };
    },

    async create(appData: Omit<Application, 'id' | 'company' | 'created_at'>, companyName: string) {
      let companyId = appData.company_id;
      
      const compRes = await db.companies.create(companyName);
      if (compRes.error) return { data: null, error: compRes.error };
      companyId = compRes.data.id;

      if (isMockMode()) {
        const apps = getLocalStorageData<Application[]>('cc_applications', []);
        const newApp: Application = {
          ...appData,
          id: 'a-' + Math.random().toString(36).substr(2, 9),
          company_id: companyId,
          created_at: new Date().toISOString()
        };
        apps.push(newApp);
        setLocalStorageData('cc_applications', apps);

        // Add recruitment log
        const logs = getLocalStorageData<RecruitmentLog[]>('cc_logs', []);
        logs.push({
          id: 'l-' + Math.random().toString(36).substr(2, 9),
          application_id: newApp.id,
          status: newApp.status,
          notes: 'Application created.',
          logged_at: new Date().toISOString()
        });
        setLocalStorageData('cc_logs', logs);

        return { data: newApp, error: null };
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('applications')
        .insert({
          ...appData,
          company_id: companyId,
          user_id: user?.id
        })
        .select()
        .single();
      return { data, error };
    },

    async update(id: string, appData: Partial<Omit<Application, 'id' | 'company' | 'created_at'>>, companyName?: string) {
      let companyId = appData.company_id;

      if (companyName) {
        const compRes = await db.companies.create(companyName);
        if (compRes.error) return { data: null, error: compRes.error };
        companyId = compRes.data.id;
      }

      if (isMockMode()) {
        const apps = getLocalStorageData<Application[]>('cc_applications', []);
        const appIndex = apps.findIndex(a => a.id === id);
        if (appIndex === -1) return { data: null, error: new Error('Not found') };
        
        const oldStatus = apps[appIndex].status;
        const newStatus = appData.status || oldStatus;

        const updatedApp = {
          ...apps[appIndex],
          ...appData,
          ...(companyId ? { company_id: companyId } : {})
        };
        apps[appIndex] = updatedApp as Application;
        setLocalStorageData('cc_applications', apps);

        if (oldStatus !== newStatus) {
          const logs = getLocalStorageData<RecruitmentLog[]>('cc_logs', []);
          logs.push({
            id: 'l-' + Math.random().toString(36).substr(2, 9),
            application_id: id,
            status: newStatus,
            notes: `Status updated from ${oldStatus} to ${newStatus}.`,
            logged_at: new Date().toISOString()
          });
          setLocalStorageData('cc_logs', logs);
        }

        return { data: updatedApp, error: null };
      }

      const supabase = createClient();
      const updatePayload: any = { ...appData };
      if (companyId) updatePayload.company_id = companyId;

      const { data, error } = await supabase
        .from('applications')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    async delete(id: string) {
      if (isMockMode()) {
        const apps = getLocalStorageData<Application[]>('cc_applications', []);
        const filtered = apps.filter(a => a.id !== id);
        setLocalStorageData('cc_applications', filtered);
        return { error: null };
      }
      const supabase = createClient();
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);
      return { error };
    }
  },

  // Interview Operations
  interviews: {
    async list() {
      if (isMockMode()) {
        const interviews = getLocalStorageData<Interview[]>('cc_interviews', []);
        const apps = getLocalStorageData<Application[]>('cc_applications', []);
        const companies = getLocalStorageData<Company[]>('cc_companies', []);
        const populated = interviews.map(int => {
          const app = apps.find(a => a.id === int.application_id);
          return {
            ...int,
            application: app ? {
              ...app,
              company: companies.find(c => c.id === app.company_id)
            } : undefined
          };
        });
        return { data: populated, error: null };
      }
      const supabase = createClient();
      const { data, error } = await supabase
        .from('interviews')
        .select('*, application:applications(*, company:companies(*))')
        .order('interview_date');
      return { data, error };
    },

    async create(interview: Omit<Interview, 'id' | 'application'>) {
      if (isMockMode()) {
        const interviews = getLocalStorageData<Interview[]>('cc_interviews', []);
        const newInterview = {
          ...interview,
          id: 'i-' + Math.random().toString(36).substr(2, 9)
        };
        interviews.push(newInterview);
        setLocalStorageData('cc_interviews', interviews);
        return { data: newInterview, error: null };
      }
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // Retrieve application details for Google Calendar context
      const { data: appData } = await db.applications.getById(interview.application_id);
      const companyName = appData?.company?.name || 'Perusahaan';
      const position = appData?.position || 'Posisi';

      // Check if user has Google session token (cookie first for client persistence, session as fallback)
      const { data: { session } } = await supabase.auth.getSession();
      const providerToken = getCookie('google_provider_token') || session?.provider_token;
      
      let googleEventId = null;
      if (providerToken) {
        try {
          const apiRes = await fetch('/api/calendar', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${providerToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'create',
              position,
              companyName,
              interviewDate: interview.interview_date,
              type: interview.type,
              locationLink: interview.location_link,
              notes: interview.notes,
            }),
          });
          if (apiRes.ok) {
            const apiData = await apiRes.json();
            googleEventId = apiData.eventId;
          }
        } catch (err) {
          console.error('Failed to sync to Google Calendar:', err);
        }
      }

      let { data, error } = await supabase
        .from('interviews')
        .insert({ ...interview, user_id: user?.id, google_event_id: googleEventId })
        .select()
        .single();

      if (error && (error.message.includes('google_event_id') || error.code === '42703')) {
        // Fallback: try inserting without google_event_id if column doesn't exist in DB
        const fallbackRes = await supabase
          .from('interviews')
          .insert({ ...interview, user_id: user?.id })
          .select()
          .single();
        data = fallbackRes.data;
        error = fallbackRes.error;
      }
      return { data, error };
    },

    async delete(id: string) {
      if (isMockMode()) {
        const interviews = getLocalStorageData<Interview[]>('cc_interviews', []);
        const filtered = interviews.filter(i => i.id !== id);
        setLocalStorageData('cc_interviews', filtered);
        return { error: null };
      }
      const supabase = createClient();

      // Fetch the interview first using select('*') to prevent failure if google_event_id column is missing
      const { data: interview } = await supabase
        .from('interviews')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (interview?.google_event_id) {
        const { data: { session } } = await supabase.auth.getSession();
        const providerToken = getCookie('google_provider_token') || session?.provider_token;
        if (providerToken) {
          try {
            await fetch('/api/calendar', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${providerToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action: 'delete',
                eventId: interview.google_event_id,
              }),
            });
          } catch (err) {
            console.error('Failed to delete event from Google Calendar:', err);
          }
        }
      }

      const { error } = await supabase
        .from('interviews')
        .delete()
        .eq('id', id);
      return { error };
    }
  },

  // Document Operations
  documents: {
    async list(applicationId: string) {
      if (isMockMode()) {
        const docs = getLocalStorageData<Document[]>('cc_docs', []);
        return { data: docs.filter(d => d.application_id === applicationId), error: null };
      }
      const supabase = createClient();
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('application_id', applicationId);
      return { data, error };
    },

    async upload(applicationId: string, type: 'CV' | 'Cover Letter' | 'Certificate', file: File) {
      if (isMockMode()) {
        const docs = getLocalStorageData<Document[]>('cc_docs', []);
        const newDoc: Document = {
          id: 'd-' + Math.random().toString(36).substr(2, 9),
          application_id: applicationId,
          document_type: type,
          file_name: file.name,
          file_path: URL.createObjectURL(file), // Mock local object URL
          created_at: new Date().toISOString()
        };
        docs.push(newDoc);
        setLocalStorageData('cc_docs', docs);
        return { data: newDoc, error: null };
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${applicationId}/${type}_${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('recruitment-documents')
        .upload(fileName, file);

      if (uploadError) return { data: null, error: uploadError };

      const { data, error } = await supabase
        .from('documents')
        .insert({
          application_id: applicationId,
          user_id: user?.id,
          document_type: type,
          file_name: file.name,
          file_path: uploadData.path
        })
        .select()
        .single();

      return { data, error };
    },

    async delete(id: string, filePath: string) {
      if (isMockMode()) {
        const docs = getLocalStorageData<Document[]>('cc_docs', []);
        const filtered = docs.filter(d => d.id !== id);
        setLocalStorageData('cc_docs', filtered);
        return { error: null };
      }

      const supabase = createClient();
      // Delete from storage first
      await supabase.storage.from('recruitment-documents').remove([filePath]);
      
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);
      return { error };
    }
  },

  // Recruitment Logs
  logs: {
    async list(applicationId: string) {
      if (isMockMode()) {
        const logs = getLocalStorageData<RecruitmentLog[]>('cc_logs', []);
        return {
          data: logs
            .filter(l => l.application_id === applicationId)
            .sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()),
          error: null
        };
      }
      const supabase = createClient();
      const { data, error } = await supabase
        .from('recruitment_logs')
        .select('*')
        .eq('application_id', applicationId)
        .order('logged_at', { ascending: true });
      return { data, error };
    }
  }
};
