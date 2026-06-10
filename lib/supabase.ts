import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export interface LeaderboardEntry {
  id: string;
  nickname: string;
  score: number;
  created_at: string;
}

export async function fetchTopScores(limit = 20): Promise<LeaderboardEntry[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .order("score", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function submitScore(nickname: string, score: number) {
  if (!supabase) return;
  const { error } = await supabase
    .from("leaderboard")
    .insert({ nickname, score });
  if (error) throw error;
}
