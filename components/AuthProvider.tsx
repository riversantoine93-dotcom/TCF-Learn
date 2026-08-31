"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthValue = { user: User | null; loading: boolean; signOut: () => Promise<void> };
const AuthContext = createContext<AuthValue>({ user: null, loading: true, signOut: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setLoading(false); });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user ?? null); setLoading(false); });
    return () => data.subscription.unsubscribe();
  }, []);

  const signOut = async () => { if (supabase) await supabase.auth.signOut(); setUser(null); };
  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
