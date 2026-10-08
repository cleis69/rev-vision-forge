import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getSupabase } from "@/lib/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";
import { AppError, NO_RIGHTS, dbErrorMessage } from "./errors";
import { compareNumeros, type Lot, type LotStatus } from "./lot-fields";

/* Lots of a programme. Every member (owner or commercial) adds, edits and
   deletes them (RLS); deleting a lot keeps its visit requests. */

const lotsKey = (projectId: string) => ["lots", projectId] as const;

const byNumero = (a: Lot, b: Lot) => compareNumeros(a.numero, b.numero);

export function useLots(projectId: string) {
  return useQuery({
    queryKey: lotsKey(projectId),
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from("lots")
        .select("*")
        .eq("project_id", projectId);
      if (error) throw error;
      return data.sort(byNumero);
    },
  });
}

/** Message for a lot that could not be saved. */
export function lotErrorMessage(error: unknown, numero?: string): string {
  return dbErrorMessage(
    error,
    numero ? `Le lot n° ${numero} existe déjà.` : "Un de ces numéros de lot existe déjà.",
  );
}

export type NewLot = Omit<TablesInsert<"lots">, "project_id">;

export function useCreateLots(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (lots: NewLot[]) => {
      const { data, error } = await getSupabase()
        .from("lots")
        .insert(lots.map((lot) => ({ ...lot, project_id: projectId })))
        .select("*");
      if (error) throw error;
      return data;
    },
    onSuccess: (created) =>
      queryClient.setQueryData<Lot[]>(lotsKey(projectId), (lots = []) =>
        [...lots, ...created].sort(byNumero),
      ),
  });
}

/** Saves one lot right away; the table shows the new value before the answer and goes back on failure. */
export function useUpdateLot(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: TablesUpdate<"lots"> }) => {
      const { data, error } = await getSupabase()
        .from("lots")
        .update(values)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, values }) => {
      await queryClient.cancelQueries({ queryKey: lotsKey(projectId) });
      const previous = queryClient.getQueryData<Lot[]>(lotsKey(projectId));
      queryClient.setQueryData<Lot[]>(lotsKey(projectId), (lots = []) =>
        lots.map((lot) => (lot.id === id ? { ...lot, ...values } : lot)).sort(byNumero),
      );
      return { previous };
    },
    onError: (error, { values }, context) => {
      if (context?.previous) queryClient.setQueryData(lotsKey(projectId), context.previous);
      toast.error(lotErrorMessage(error, values.numero ?? undefined));
    },
    onSuccess: (saved) =>
      queryClient.setQueryData<Lot[]>(lotsKey(projectId), (lots = []) =>
        lots.map((lot) => (lot.id === saved.id ? saved : lot)).sort(byNumero),
      ),
  });
}

export function useSetLotsStatus(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, statut }: { ids: string[]; statut: LotStatus }) => {
      const { data, error } = await getSupabase()
        .from("lots")
        .update({ statut })
        .in("id", ids)
        .select("*");
      if (error) throw error;
      if (data.length < ids.length) throw new AppError(NO_RIGHTS);
      return data;
    },
    onSuccess: (saved) => {
      const byId = new Map(saved.map((lot) => [lot.id, lot]));
      queryClient.setQueryData<Lot[]>(lotsKey(projectId), (lots = []) =>
        lots.map((lot) => byId.get(lot.id) ?? lot),
      );
    },
  });
}

export function useDeleteLots(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { data, error } = await getSupabase().from("lots").delete().in("id", ids).select("id");
      if (error) throw error;
      if (data.length < ids.length) throw new AppError(NO_RIGHTS);
      return ids;
    },
    onSuccess: (ids) => {
      const removed = new Set(ids);
      queryClient.setQueryData<Lot[]>(lotsKey(projectId), (lots = []) =>
        lots.filter((lot) => !removed.has(lot.id)),
      );
    },
  });
}

/** Import: one statement, so the file goes in entirely or not at all. */
export function useImportLots(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rows: TablesInsert<"lots">[]) => {
      const { data, error } = await getSupabase()
        .from("lots")
        .upsert(rows, { onConflict: "project_id,numero" })
        .select("id");
      if (error) throw error;
      return data.length;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: lotsKey(projectId) }),
  });
}
