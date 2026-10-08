import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { getSupabase } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import { useAuth } from "@/lib/supabase/auth";

export type Membership = {
  role: Tables<"members">["role"];
  organization: Pick<
    Tables<"organizations">,
    "id" | "name" | "slug" | "logo_path" | "brand_color" | "brand_font"
  >;
};

type OrganizationsState = {
  memberships: Membership[];
  active: Membership | undefined;
  setActiveId: (id: string) => void;
  loading: boolean;
  error: boolean;
};

const OrganizationsContext = createContext<OrganizationsState>({
  memberships: [],
  active: undefined,
  setActiveId: () => {},
  loading: true,
  error: false,
});

const STORAGE_KEY = "rev-app-organization";

/** Organizations of the signed-in user, and the one being worked on. */
export function OrganizationsProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const query = useQuery({
    queryKey: ["memberships", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Membership[]> => {
      const { data, error } = await getSupabase()
        .from("members")
        .select(
          "role, organization:organizations(id, name, slug, logo_path, brand_color, brand_font)",
        )
        .eq("user_id", userId ?? "")
        .order("created_at");
      if (error) throw error;
      return data.filter((m): m is Membership => m.organization !== null);
    },
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  useEffect(() => {
    try {
      setActiveId(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      /* storage unavailable: keep the first organization */
    }
  }, []);

  const value = useMemo<OrganizationsState>(() => {
    const memberships = query.data ?? [];
    return {
      memberships,
      active: memberships.find((m) => m.organization.id === activeId) ?? memberships[0],
      setActiveId: (id) => {
        setActiveId(id);
        try {
          window.localStorage.setItem(STORAGE_KEY, id);
        } catch {
          /* storage unavailable */
        }
      },
      loading: query.isPending,
      error: query.isError,
    };
  }, [query.data, query.isPending, query.isError, activeId]);

  return <OrganizationsContext.Provider value={value}>{children}</OrganizationsContext.Provider>;
}

export const useOrganizations = () => useContext(OrganizationsContext);
