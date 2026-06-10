create table leaderboard (
  id uuid primary key default gen_random_uuid(),
  nickname text not null check (char_length(nickname) between 1 and 12),
  score int not null check (score >= 0 and score <= 100000),
  created_at timestamptz default now()
);

alter table leaderboard enable row level security;

create policy "read all" on leaderboard for select using (true);
create policy "insert only" on leaderboard for insert with check (true);

create index leaderboard_score_idx on leaderboard (score desc);
