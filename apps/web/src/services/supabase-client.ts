import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://khqtqswwmzqlcglhjias.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_PgZQekvDKA1IkIcYGDxGig_5tjcgzHB";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
	auth: {
		storage: typeof window !== "undefined" ? localStorage : undefined,
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: true,
	},
});
