# CareerCompass – Job Application & Internship Management System

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)
![License](https://img.shields.io/badge/License-MIT-green)
![Portfolio Project](https://img.shields.io/badge/Portfolio-Software%20Engineer-blue)

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge)](https://job-application-tracker-gamma-one.vercel.app)



CareerCompass is a modern centralized SaaS-dashboard web application designed specifically to help students, fresh graduates, and job seekers track, manage, and monitor their entire recruitment pipeline in real-time.

This application is ready to be used as a world-class portfolio (Software Engineer / Apple Developer Academy) with integrations of Next.js 15, Tailwind CSS v4, and Supabase PostgreSQL.

---

## 🚀 Key Features

- **Interactive Career Dashboard**: Summary information of total applications, active recruitment statuses, visual status distribution charts, and upcoming interview schedules.
- **Application Management (CRUD)**: Log position, job type (Internship, Full Time, Part Time, Contract), location, salary range, job link, and important notes.
- **Real-time Status System & Visual Timeline**: Track application status starting from *Applied*, *Screening*, *Technical Test*, *Interview*, *HR Interview*, *Offered*, *Accepted*, to *Rejected*.
- **Interview Schedule Calendar**: Manage schedules, meeting dates, online interview links (Google Meet / Zoom), and visual reminders.
- **Integrated Document Storage**: Upload CV (PDF), Cover Letters, and supporting certificates directly to the cloud (Supabase Storage) with a 5MB file size limit.
- **Export Reports**: Download your application reports anytime in **PDF** and **Excel** formats.
- **Standalone Demo Mode (Mock Mode)**: Ability to run locally instantly using HTML5 LocalStorage if Supabase API keys are not configured.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React, Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Lucide Icons.
- **Backend / BaaS**: Next.js Server Actions & Supabase.
- **Database**: PostgreSQL (Supabase DB).
- **Authentication**: Supabase Auth (Google Single Sign-in / Gmail).
- **Storage**: Supabase Storage Buckets (File upload PDF).
- **Deployment**: Vercel.

---

## 📊 Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    users ||--o| profiles : "has"
    users ||--o{ companies : "registers"
    users ||--o{ applications : "tracks"
    companies ||--o{ applications : "is_linked_to"
    applications ||--o{ interviews : "schedules"
    applications ||--o{ documents : "attaches"
    applications ||--o{ recruitment_logs : "records"

    profiles {
        uuid id PK
        string full_name
        string phone
        string avatar_url
        timestamp created_at
    }

    companies {
        uuid id PK
        uuid user_id FK
        string name
        boolean is_favorite
        timestamp created_at
    }

    applications {
        uuid id PK
        uuid user_id FK
        uuid company_id FK
        string position
        string job_type
        string location
        date applied_date
        string salary_range
        string job_link
        string notes
        string status
        timestamp created_at
    }

    interviews {
        uuid id PK
        uuid application_id FK
        uuid user_id FK
        timestamp interview_date
        string type
        string notes
        string location_link
    }

    documents {
        uuid id PK
        uuid application_id FK
        uuid user_id FK
        string document_type
        string file_path
        string file_name
        timestamp created_at
    }

    recruitment_logs {
        uuid id PK
        uuid application_id FK
        string status
        string notes
        timestamp logged_at
    }
```

---

## 🏛️ System Architecture Diagram

```mermaid
graph TD
    Client[Client Browser - Next.js React] -->|HTTPS Requests| Vercel[Vercel Serverless Hosting]
    Vercel -->|Server Actions / API| Supabase[Supabase BaaS Platform]
    Supabase -->|Database Queries| Postgres[(PostgreSQL Database)]
    Supabase -->|Authentication Flows| Auth[Supabase Auth / Google OAuth]
    Supabase -->|Asset Management| Storage[Supabase Storage Buckets]
```

---

## 📝 API & Database Setup Guide

All table queries, automatic profile creation triggers upon OAuth registration, and automatic timeline logs upon status changes have been consolidated into a single unified SQL script.

Open the **Supabase SQL Editor** panel, copy, and run the following schema script:
👉 [schema.sql](file:///d:/PROJECT/job%20Application%20Tracker/supabase/schema.sql)

---

## ⚙️ Local Installation

### 1. Clone Workspace & Install Dependencies
```bash
# Make sure you are in the project root folder
npm install
```

### 2. Configure Environment Variables
Copy the `.env.example` file to `.env.local` and fill in your Supabase credentials:
```bash
cp .env.example .env.local
```

Fill in the `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```
> 💡 *If you leave the keys as placeholder values above, the application will intelligently and automatically activate **Demo Mode** based on LocalStorage so you can do an instant demo without a database.*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3050](http://localhost:3050) in your browser.

---


## 🚀 Deployment to Vercel Guide

1. Create a new repository on GitHub and push the code.
2. Login to **Vercel** and create a new project by importing your repository.
3. Under the **Environment Variables** section in the Vercel dashboard, add the variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy** and your CareerCompass application is ready to be accessed online!

## Screenshots

Dashboard
<img width="1832" height="895" alt="image" src="https://github.com/user-attachments/assets/cb39506a-d988-425a-8c68-9e6386d434dc" />

<img width="1809" height="889" alt="image" src="https://github.com/user-attachments/assets/267d269e-012f-4472-8b9a-d51b953259eb" />


Application Management

<img width="1803" height="891" alt="image" src="https://github.com/user-attachments/assets/f657e46d-ff4d-4708-ad25-e52e1f7ecf6f" />

Interview Calendar
<img width="1735" height="874" alt="image" src="https://github.com/user-attachments/assets/2ed255ce-349d-4e96-91f1-5c8296bdcee8" />

Analytics

<img width="1781" height="877" alt="image" src="https://github.com/user-attachments/assets/a05e4deb-b26d-4716-8a65-b34b39c4d98b" />
<img width="1732" height="886" alt="image" src="https://github.com/user-attachments/assets/f38682ad-ef5b-4ee3-aa23-9fe6107819b0" />

Dark Mode
<img width="1772" height="902" alt="image" src="https://github.com/user-attachments/assets/597bea4e-30b3-4279-833a-26673e3ff1c1" />
<img width="1792" height="866" alt="image" src="https://github.com/user-attachments/assets/2b385bca-724c-47c5-9288-be7cb0100419" />


