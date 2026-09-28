"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/services/supabase-client";
import type { User, Session } from "@supabase/supabase-js";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { DEFAULT_LOGO_URL } from "@/site/brand";
import { Loader2, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface AuthContextType {
	user: User | null;
	session: Session | null;
	loading: boolean;
	signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	session: null,
	loading: true,
	signOut: async () => {},
});

export const useStudioAuth = () => useContext(AuthContext);

export function AuthGate({ children }: { children: React.ReactNode }) {
	const [session, setSession] = useState<Session | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	// Form states
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);

	useEffect(() => {
		// Check for hash parameters from SSO (e.g. #access_token=...&refresh_token=...)
		if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
			const hashParams = new URLSearchParams(window.location.hash.substring(1));
			const accessToken = hashParams.get("access_token");
			const refreshToken = hashParams.get("refresh_token");

			if (accessToken && refreshToken) {
				supabase.auth
					.setSession({
						access_token: accessToken,
						refresh_token: refreshToken,
					})
					.then(({ data }) => {
						if (data.session) {
							setSession(data.session);
							setUser(data.session.user);
							// Clean hash from URL cleanly
							window.history.replaceState(null, "", window.location.pathname + window.location.search);
						}
					})
					.catch(() => {});
			}
		}

		// Initial session check
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
			setUser(session?.user ?? null);
			setLoading(false);
		});

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			setUser(session?.user ?? null);
			setLoading(false);
		});

		return () => subscription.unsubscribe();
	}, []);

	const handleGoogleLogin = async () => {
		setGoogleLoading(true);
		try {
			const redirectUrl = typeof window !== "undefined" ? window.location.href : "https://studio.publicidadees.com.br/projects";
			const { error } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo: redirectUrl,
					queryParams: {
						access_type: "offline",
						prompt: "select_account",
					},
				},
			});
			if (error) throw error;
		} catch (error: any) {
			toast.error("Erro ao conectar com Google", {
				description: error.message || "Tente novamente ou use e-mail e senha.",
			});
			setGoogleLoading(false);
		}
	};

	const handleEmailLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email.trim() || !password) return;

		setIsSubmitting(true);
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email: email.trim().toLowerCase(),
				password,
			});

			if (error) {
				toast.error("Falha no login", {
					description: error.message || "E-mail ou senha inválidos.",
				});
				return;
			}

			if (data.session) {
				setSession(data.session);
				setUser(data.user);
				toast.success("Acesso autorizado!", {
					description: "Bem-vindo ao ES Cut Studio.",
				});
			}
		} catch (error: any) {
			toast.error("Erro inesperado", {
				description: error.message || "Verifique sua conexão e tente novamente.",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const signOut = async () => {
		await supabase.auth.signOut();
		setSession(null);
		setUser(null);
		toast.info("Você saiu da conta.");
	};

	if (loading) {
		return (
			<div className="flex h-screen w-screen flex-col items-center justify-center bg-background gap-4">
				<div className="size-14 rounded-2xl bg-secondary/50 border border-border flex items-center justify-center p-3 animate-pulse">
					<Image
						src={DEFAULT_LOGO_URL}
						alt="Publicidade ES"
						width={40}
						height={40}
						className="object-contain"
					/>
				</div>
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Loader2 className="size-4 animate-spin text-primary" />
					<span>Autenticando sessão da Publicidade ES...</span>
				</div>
			</div>
		);
	}

	// Se não estiver logado, exibe a tela de login obrigatório
	if (!user) {
		const cadastroUrl = typeof window !== "undefined"
			? `https://publicidadees.com.br/cadastro?next=${encodeURIComponent(window.location.href)}`
			: "https://publicidadees.com.br/cadastro";

		return (
			<div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
				{/* Background ambient blur */}
				<div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

				<div className="w-full max-w-md relative z-10 space-y-6">
					{/* Logo & Headline */}
					<div className="text-center space-y-2">
						<div className="inline-flex size-16 rounded-2xl bg-card border border-border shadow-md items-center justify-center p-3.5 mb-2">
							<Image
								src={DEFAULT_LOGO_URL}
								alt="Publicidade ES"
								width={44}
								height={44}
								className="object-contain"
							/>
						</div>
						<div className="flex items-center justify-center gap-2">
							<span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
								Acesso Restrito
							</span>
							<span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
								Login Único
							</span>
						</div>
						<h1 className="text-2xl font-bold tracking-tight text-foreground">
							Entre no ES Cut Studio
						</h1>
						<p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
							Utilize sua conta da <strong className="text-foreground">Publicidade ES</strong> para acessar o editor profissional de vídeos.
						</p>
					</div>

					{/* Login Card */}
					<div className="p-6 sm:p-7 rounded-2xl border border-border bg-card/90 backdrop-blur-md shadow-xl space-y-5">
						{/* Google Login Button */}
						<Button
							type="button"
							variant="outline"
							onClick={handleGoogleLogin}
							disabled={googleLoading || isSubmitting}
							className="w-full h-11 text-sm font-semibold flex items-center justify-center gap-3 border-border hover:bg-accent cursor-pointer"
						>
							{googleLoading ? (
								<Loader2 className="size-4 animate-spin text-muted-foreground" />
							) : (
								<svg className="size-4.5" viewBox="0 0 24 24">
									<path
										fill="#4285F4"
										d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									/>
									<path
										fill="#34A853"
										d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									/>
									<path
										fill="#FBBC05"
										d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
									/>
									<path
										fill="#EA4335"
										d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
									/>
								</svg>
							)}
							<span>Continuar com o Google</span>
						</Button>

						{/* Divider */}
						<div className="relative flex items-center justify-center">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-border" />
							</div>
							<span className="relative px-3 bg-card text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
								ou com e-mail e senha
							</span>
						</div>

						{/* Form */}
						<form onSubmit={handleEmailLogin} className="space-y-4">
							<div className="space-y-1.5 text-left">
								<Label htmlFor="email" className="text-xs font-medium text-foreground">
									E-mail cadastrado
								</Label>
								<div className="relative">
									<Mail className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
									<Input
										id="email"
										type="email"
										required
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="seu@email.com"
										className="pl-9 text-sm h-10"
									/>
								</div>
							</div>

							<div className="space-y-1.5 text-left">
								<div className="flex items-center justify-between">
									<Label htmlFor="password" className="text-xs font-medium text-foreground">
										Senha
									</Label>
									<Link
										href="https://publicidadees.com.br/login"
										target="_blank"
										className="text-[11px] text-primary hover:underline"
									>
										Esqueceu a senha?
									</Link>
								</div>
								<div className="relative">
									<Lock className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
									<Input
										id="password"
										type="password"
										required
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder="••••••••"
										className="pl-9 text-sm h-10"
									/>
								</div>
							</div>

							<Button
								type="submit"
								disabled={isSubmitting || googleLoading}
								className="w-full h-11 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md gap-2"
							>
								{isSubmitting ? (
									<Loader2 className="size-4 animate-spin text-primary-foreground" />
								) : (
									<>
										<span>Entrar no Editor</span>
										<ArrowRight className="size-4" />
									</>
								)}
							</Button>
						</form>

						{/* Link para criar conta na Publicidade ES */}
						<div className="pt-2 text-center border-t border-border/50 text-xs text-muted-foreground">
							Não possui uma conta?{" "}
							<a
								href={cadastroUrl}
								className="text-primary hover:underline font-semibold inline-flex items-center gap-1"
							>
								Criar conta na Publicidade ES
							</a>
						</div>
					</div>

					{/* Security footnote */}
					<div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
						<ShieldCheck className="size-3.5 text-emerald-500" />
						<span>Autenticação criptografada protegida pela Publicidade ES</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<AuthContext.Provider value={{ user, session, loading, signOut }}>
			{children}
		</AuthContext.Provider>
	);
}
