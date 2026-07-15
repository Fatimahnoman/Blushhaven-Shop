import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

// Generic fetcher with error handling
export async function apiQuery<T>(
  table: string,
  options?: {
    select?: string;
    filters?: Record<string, any>;
    eq?: [string, any][];
    neq?: [string, any][];
    order?: { column: string; ascending?: boolean };
    limit?: number;
    offset?: number;
  }
): Promise<T[]> {
  let query = supabase.from(table).select(options?.select ?? "*");
  
  if (options?.filters) {
    for (const [key, value] of Object.entries(options.filters)) {
      if (value !== undefined && value !== null && value !== "") {
        query = query.eq(key, value);
      }
    }
  }
  if (options?.eq) {
    for (const [col, val] of options.eq) query = query.eq(col, val);
  }
  if (options?.neq) {
    for (const [col, val] of options.neq) query = query.neq(col, val);
  }
  if (options?.order) {
    query = query.order(options.order.column, { ascending: options.order.ascending ?? false });
  }
  if (options?.limit) query = query.limit(options.limit);
  if (options?.offset) query = query.range(options.offset, options.offset + (options.limit ?? 10) - 1);
  
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}

export async function apiInsert<T>(table: string, data: Record<string, any>): Promise<T> {
  const { data: result, error } = await supabase.from(table).insert(data).select().single();
  if (error) throw new Error(error.message);
  return result as T;
}

export async function apiUpdate<T>(table: string, id: string, data: Record<string, any>): Promise<T> {
  const { data: result, error } = await supabase.from(table).update(data).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return result as T;
}

export async function apiDelete(table: string, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function apiCount(table: string, filters?: Record<string, any>): Promise<number> {
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) query = query.eq(key, value);
    }
  }
  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function apiSearch<T>(
  table: string,
  column: string,
  term: string,
  options?: { limit?: number; select?: string }
): Promise<T[]> {
  const { data, error } = await supabase
    .from(table)
    .select(options?.select ?? "*")
    .ilike(column, `%${term}%`)
    .limit(options?.limit ?? 10);
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}

// Paginated query
export async function apiPaginate<T>(
  table: string,
  page: number = 1,
  perPage: number = 20,
  options?: {
    select?: string;
    filters?: Record<string, any>;
    order?: { column: string; ascending?: boolean };
    search?: { column: string; term: string };
  }
): Promise<{ data: T[]; total: number; page: number; totalPages: number }> {
  let query = supabase.from(table).select(options?.select ?? "*", { count: "exact" });
  
  if (options?.filters) {
    for (const [key, value] of Object.entries(options.filters)) {
      if (value !== undefined && value !== null && value !== "") {
        query = query.eq(key, value);
      }
    }
  }
  if (options?.search?.term) {
    query = query.ilike(options.search.column, `%${options.search.term}%`);
  }
  if (options?.order) {
    query = query.order(options.order.column, { ascending: options.order.ascending ?? false });
  }
  
  const offset = (page - 1) * perPage;
  query = query.range(offset, offset + perPage - 1);
  
  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  
  const total = count ?? 0;
  return {
    data: (data ?? []) as T[],
    total,
    page,
    totalPages: Math.ceil(total / perPage),
  };
}
