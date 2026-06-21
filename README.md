# FlexTracker | Premium Gym Workout Logger

FlexTracker is a mobile-optimized, dark-mode gym tracker application built with a Python Django API backend and a Next.js (React) frontend. It features dynamic workout logging, draft saving, and pure SVG visual fitness analytics.

---

## 📊 Analytics & UI/UX Presentation

Here is a visual mockup of the premium dark-mode dashboard interface:

![FlexTracker Dashboard Mockup](./dashboard_mockup.png)

---

## 🛠️ Key Features

### 1. Database Seeding & Custom Exercises
- Features pre-populated core muscle groups (Legs, Glutes, Abs, Chest, Triceps, Biceps, Shoulders, and **Lats**).
- Includes all standard sub-exercises seeded automatically (e.g. Legs extensions, squats, pullups, machine rows, etc.).
- Secure Django admin portal for full exercise inventory management.

### 2. Interactive SVG Analytics Charts
- **Volume Progression (Line Chart)**: Tracks total weight volume (sets × reps × weight) over time with hover-ring interactions.
- **Consistency Tracker (Bar Chart)**: Visualizes workout counts per day of the week, with hover transitions.
- **Muscle Focus Distribution**: Progress bars representing the set distribution logged for each muscle group.
- *Sample Data Fallback*: Automatically displays mock curves if there is no logged history so the UI looks complete right away.

### 3. Phone & Mobile Optimization
- **Responsive Navigation**: Navbar scales to a stacked centered layout on phone viewports.
- **Grid Layout Wrapping**: Workout logging grids wrap to single columns, scaling fields to 100% width on phone screens.
- **Form Scaling**: Inputs, buttons, and deletion triggers feature large tap targets for easy logging.

---

## 🚀 Hosting Deployment Guide

### 1. Python Django Backend (Render + Supabase)
To run the backend completely free indefinitely, we use Supabase for the database and Render for the server:

#### **A. Set Up your Free PostgreSQL Database on Supabase**
1. Go to **[Supabase.com](https://supabase.com)** and sign up for a free account.
2. Click **New Project**, name it (e.g., `gymtracker-db`), and set a **Database Password**.
3. Go to **Project Settings** (gear icon) > **Database**.
4. Scroll to **Connection String**, click the **URI** tab, and copy the string. Replace `[YOUR-PASSWORD]` with your actual password:
   `postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres`

#### **B. Deploy on Render**
1. Log in to **[Render.com](https://render.com)**.
2. Click **New +** > **Blueprint**.
3. Connect your GitHub account and select your **`gym-tracker`** repository.
4. Render will parse `backend/render.yaml` and configure the blueprint automatically.
5. In the env variables section, paste your Supabase connection string as the value for **`DATABASE_URL`**.
6. Click **Apply**. Render will migrate the schemas, seed the exercises, and deploy your live Python server for free!
7. Copy your hosted Web Service URL (e.g., `https://gymtracker-backend.onrender.com`).

---

### 2. Next.js Frontend (Vercel)
The frontend is already linked and hosted on Vercel:
- **Live URL**: **[https://frontend-sigma-indol-61.vercel.app](https://frontend-sigma-indol-61.vercel.app)**
- **GitHub Repository**: **[https://github.com/shankscodz/gym-tracker](https://github.com/shankscodz/gym-tracker)**

#### **Link Vercel to your Live Backend**:
1. Log in to **[Vercel.com](https://vercel.com)**.
2. Go to your `frontend` project dashboard.
3. Click **Settings** > **Environment Variables**.
4. Add the variable:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: Your hosted Render API URL (e.g., `https://gymtracker-backend.onrender.com/api` - *make sure to append `/api`*).
5. Trigger a new deployment on Vercel to apply the variable. Your site will now be fully live, connected, and 100% free!

---

## ✅ Local Server Operations

The local development instances continue running in the background for your evaluation:
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Django Admin Portal**: [http://localhost:8000/admin](http://localhost:8000/admin) (Log in using: `admin@gymtracker.com` / `AdminPassword123` to test admin mode).
