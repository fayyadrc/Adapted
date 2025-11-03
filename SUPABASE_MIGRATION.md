# Firebase to Supabase Migration Guide

This document outlines the steps taken to migrate AdaptEd from Firebase to Supabase.

## Overview

The migration replaced Firebase Authentication and Firestore with Supabase's authentication and PostgreSQL database.

## Changes Made

### Backend Changes

1. **Dependencies Updated** (`backend/requirements.txt`)
   - Removed: `firebase_admin`, `google-cloud-firestore`, `google-cloud-storage`, `google-cloud-core`, `google-crc32c`
   - Added: `supabase==2.16.1`

2. **Configuration Updated** (`backend/config.py`)
   - Added Supabase URL and API key configuration
   - Environment variables: `SUPABASE_URL`, `SUPABASE_KEY`

3. **Initialization Updated** (`backend/app/__init__.py`)
   - Removed Firebase Admin SDK initialization
   - Added Supabase client initialization
   - Global `supabase` client available for use in routes

### Frontend Changes

1. **Dependencies Updated** (`frontend/package.json`)
   - Removed: `firebase`
   - Added: `@supabase/supabase-js`

2. **Configuration File**
   - Removed: `src/firebaseConfig.js`
   - Added: `src/supabaseConfig.js` - Supabase client configuration

3. **Authentication Components Updated**
   - `src/components/Login.jsx` - Now uses Supabase authentication
   - `src/components/Signup.jsx` - Now uses Supabase authentication

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in your project details:
   - Project name
   - Database password (save this!)
   - Region (choose closest to your users)
5. Wait for the project to be created (takes ~2 minutes)

### 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **anon/public key** (for frontend)
   - **service_role key** (for backend - keep this secret!)

### 3. Configure Environment Variables

#### Backend (`backend/.env`)
Create a `.env` file in the backend directory:

```bash
SECRET_KEY=your-secret-key-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key-here
GEMINI_API_KEY=your-gemini-api-key
```

#### Frontend (`frontend/.env`)
Create a `.env` file in the frontend directory:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Install Dependencies

#### Backend
```bash
cd backend
source .venv/bin/activate  # Activate your virtual environment
pip install -r requirements.txt
```

#### Frontend
```bash
cd frontend
npm install
```

### 5. Set Up Supabase Database (Optional)

If you need to store additional user data or application data, you can create tables in Supabase:

1. Go to your Supabase project dashboard
2. Click on **Table Editor** in the sidebar
3. Create tables as needed

Example: User profiles table
```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

-- Create policies
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);
```

### 6. Configure Email Settings (Optional)

By default, Supabase requires email confirmation for new users. You can:

**Option A: Disable email confirmation (for development)**
1. Go to **Authentication** → **Providers** → **Email**
2. Uncheck "Enable email confirmations"

**Option B: Configure custom SMTP (for production)**
1. Go to **Settings** → **Authentication**
2. Scroll to "SMTP Settings"
3. Enter your SMTP provider details

### 7. Run the Application

#### Backend
```bash
cd backend
source .venv/bin/activate
python run.py
```

#### Frontend
```bash
cd frontend
npm run dev
```

## Authentication Features

### Implemented Features
- ✅ User sign up with email and password
- ✅ User login with email and password
- ✅ User metadata storage (name)
- ✅ Session management

### Available Supabase Features (Not Yet Implemented)
- 🔲 Password reset
- 🔲 Email verification
- 🔲 OAuth providers (Google, GitHub, etc.)
- 🔲 Multi-factor authentication
- 🔲 Phone authentication

## Using Supabase in Your Code

### Frontend (React)
```javascript
import { supabase } from '../supabaseConfig';

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// Sign out
await supabase.auth.signOut();

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Database operations
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id);
```

### Backend (Python)
```python
from app import supabase

# The global supabase client is available
# Use it in your routes for database operations

@app.route('/api/user-data')
def get_user_data():
    # Example database query
    response = supabase.table('profiles').select('*').execute()
    return jsonify(response.data)
```

## Migration Checklist

- [x] Replace Firebase dependencies with Supabase
- [x] Update configuration files
- [x] Update authentication logic in Login component
- [x] Update authentication logic in Signup component
- [x] Create environment variable templates
- [ ] Set up Supabase project
- [ ] Configure environment variables
- [ ] Install dependencies
- [ ] Test authentication flow
- [ ] Migrate existing user data (if any)
- [ ] Set up database tables (if needed)
- [ ] Configure email settings
- [ ] Remove `serviceAccountKey.json` file (no longer needed)

## Troubleshooting

### "Invalid API Key" Error
- Double-check your environment variables
- Make sure you're using the **anon key** in frontend and **service role key** in backend
- Restart your development servers after updating `.env` files

### Email Confirmation Required
- Check Supabase Authentication settings
- Disable email confirmation for development
- Configure SMTP for production

### CORS Issues
- Ensure your Supabase project allows your frontend URL
- Go to **Settings** → **API** → Add your frontend URL to allowed origins

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Python Client](https://supabase.com/docs/reference/python/introduction)

## Notes

- The old `firebaseConfig.js` file can be deleted after confirming the migration works
- The `serviceAccountKey.json` file is no longer needed and should be removed
- Make sure to update your `.gitignore` to include `.env` files
- Consider setting up database migrations for schema changes
