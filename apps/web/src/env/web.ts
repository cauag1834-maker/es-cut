import { z } from "zod";

const webEnvSchema = z.object({
	// Node
	NODE_ENV: z.enum(["development", "production", "test"]),
	ANALYZE: z.string().optional(),
	NEXT_RUNTIME: z.enum(["nodejs", "edge"]).optional(),

	// Public
	NEXT_PUBLIC_SITE_URL: z.string().default("https://studio.publicidadees.com.br"),
	NEXT_PUBLIC_MARBLE_API_URL: z.string().optional().default("https://api.marblecms.com"),

	// Server
	DATABASE_URL: z.string().optional().default("postgresql://postgres:postgres@localhost:5432/opencut"),

	BETTER_AUTH_SECRET: z.string().optional().default("es-cut-production-secret-32-chars-long"),
	UPSTASH_REDIS_REST_URL: z.string().optional().default("http://localhost:8079"),
	UPSTASH_REDIS_REST_TOKEN: z.string().optional().default("example_token"),
	MARBLE_WORKSPACE_KEY: z.string().optional().default("placeholder"),
	FREESOUND_CLIENT_ID: z.string().optional().default("placeholder"),
	FREESOUND_API_KEY: z.string().optional().default("placeholder"),
});

export type WebEnv = z.infer<typeof webEnvSchema>;

export const webEnv = webEnvSchema.parse(process.env);
