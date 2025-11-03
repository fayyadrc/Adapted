# Quick Start: Supabase Setup

## ⚡ Quick Setup (5 minutes)

### 1. Create Supabase Project
1. Visit [https://supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Save your database password!

### 2. Get API Keys
Go to **Settings → API** and copy:
- Project URL
- `anon` key (for frontend)
- `service_role` key (for backend)

### 3. Configure Environment Variables

**Backend** - Create `backend/.env`:
```bash
SECRET_KEY=your-secret-key
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-key
```

**Frontend** - Create `frontend/.env`:
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Install Dependencies

**Backend:**
```bash
cd backend
source .venv/bin/activate
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

### 5. Disable Email Confirmation (Development Only)
1. In Supabase Dashboard: **Authentication → Providers → Email**
2. Uncheck "Enable email confirmations"

### 6. Run the App

**Backend:**
```bash
cd backend
python run.py
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## ✅ You're Done!

Now you can sign up and log in using Supabase authentication!

---

📖 **Need more details?** See [SUPABASE_MIGRATION.md](./SUPABASE_MIGRATION.md) for complete documentation.
