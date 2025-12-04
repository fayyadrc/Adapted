-- Create folders table
create table public.folders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  color text default 'bg-blue-50 text-blue-600',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for folders
alter table public.folders enable row level security;

-- Create policies for folders
create policy "Users can view their own folders"
  on public.folders for select
  using (auth.uid() = user_id);

create policy "Users can insert their own folders"
  on public.folders for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own folders"
  on public.folders for update
  using (auth.uid() = user_id);

create policy "Users can delete their own folders"
  on public.folders for delete
  using (auth.uid() = user_id);

-- Add folder_id to results table
alter table public.results 
add column folder_id uuid references public.folders(id) on delete set null;

-- Update results policies to ensure folder access (optional, but good practice if RLS gets complex)
-- Existing policies on results should already cover ownership via user_id, so explicit folder checks might not be strictly necessary for basic CRUD if user_id is consistent.
