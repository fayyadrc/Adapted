-- Create the results table
create table public.results (
  id uuid not null default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  title text,
  content jsonb,
  created_at timestamp with time zone not null default now(),
  constraint results_pkey primary key (id)
);

-- Enable Row Level Security (RLS)
alter table public.results enable row level security;

-- Create policies
create policy "Users can view their own results"
on public.results for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own results"
on public.results for insert
to authenticated
with check (auth.uid() = user_id);
