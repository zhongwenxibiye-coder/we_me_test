import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function initSupabase(url: string, anonKey: string): SupabaseClient {
  if (!client) {
    client = createClient(url, anonKey);
  }
  return client;
}

export function getSupabase(): SupabaseClient {
  if (!client) throw new Error("Supabase client not initialized");
  return client;
}
