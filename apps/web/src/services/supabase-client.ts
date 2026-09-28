import { createClient } from "@supabase/supabase-js";

export const DEFAULT_SUPABASE_URL = "https://khqtqswwmzqlcglhjias.supabase.co";
export const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_PgZQekvDKA1IkIcYGDxGig_5tjcgzHB";

export const SUPABASE_URL =
	process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const SUPABASE_ANON_KEY =
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
	(process.env as any)["PRÓXIMA_CHAVE_ANÔN_SUPABASE_PÚBLICA"] ||
	DEFAULT_SUPABASE_ANON_KEY;


export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
	auth: {
		storage: typeof window !== "undefined" ? localStorage : undefined,
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: true,
	},
});
