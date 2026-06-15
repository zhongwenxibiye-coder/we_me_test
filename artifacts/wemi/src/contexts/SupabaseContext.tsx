import { createContext, useContext, type ReactNode } from "react";
import type { SupabaseClient } from "@/lib/supabase";

const SupabaseContext = createContext<SupabaseClient | null>(null);

export function SupabaseProvider({
  client,
  children,
}: {
  client: SupabaseClient;
  children: ReactNode;
}) {
  return <SupabaseContext.Provider value={client}>{children}</SupabaseContext.Provider>;
}

export function useSupabase(): SupabaseClient {
  const client = useContext(SupabaseContext);
  if (!client) throw new Error("useSupabase must be used within SupabaseProvider");
  return client;
}
