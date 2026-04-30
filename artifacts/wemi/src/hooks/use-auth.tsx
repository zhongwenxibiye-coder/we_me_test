import { useEffect, useState } from "react";
import { getCurrentUser, type User } from "@/lib/auth";

export function useAuth(): User | null {
  const [user, setUser] = useState<User | null>(() => getCurrentUser());

  useEffect(() => {
    const sync = () => setUser(getCurrentUser());
    window.addEventListener("wemi:auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("wemi:auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return user;
}
