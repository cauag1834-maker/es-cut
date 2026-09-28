import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY =
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
	(process.env as any)["PRÓXIMA_CHAVE_ANÔN_SUPABASE_PÚBLICA"] ||
	"";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
	console.warn(
		"[Supabase] NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY não foram definidos no ambiente.",
	);
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
	auth: {
		storage: typeof window !== "undefined" ? localStorage : undefined,
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: true,
	},
});
