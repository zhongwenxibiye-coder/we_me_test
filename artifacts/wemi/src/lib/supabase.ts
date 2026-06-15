import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type { SupabaseClient };

// Preserve the client instance across Vite HMR reloads using hot.data
let _client: SupabaseClient | null =
  (import.meta.hot?.data as Record<string, unknown>)?.supabaseClient as SupabaseClient | null ?? null;
let _url: string =
  ((import.meta.hot?.data as Record<string, unknown>)?.supabaseUrl as string | undefined) ?? "";
let _key: string =
  ((import.meta.hot?.data as Record<string, unknown>)?.supabaseKey as string | undefined) ?? "";

if (import.meta.hot) {
  import.meta.hot.dispose((data: Record<string, unknown>) => {
    data.supabaseClient = _client;
    data.supabaseUrl = _url;
    data.supabaseKey = _key;
  });
}

export function initSupabase(url: string, anonKey: string): SupabaseClient {
  _url = url;
  _key = anonKey;
  _client = createClient(url, anonKey);
  return _client;
}

export function getSupabase(): SupabaseClient | null {
  if (!_client && _url && _key) {
    _client = createClient(_url, _key);
  }
  return _client;
}
