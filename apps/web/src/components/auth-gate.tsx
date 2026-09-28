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
import {
	Loader2,
	Lock,
	Mail,
	ArrowRight,
	ShieldCheck,
	Phone,
	CheckCircle2,
	Globe,
	LogOut,
} from "lucide-react";
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

export interface CountryInfo {
	code: string;
	name: string;
	ddi: string;
	flag: string;
	placeholder: string;
	mask?: (val: string) => string;
}

export const COUNTRIES: CountryInfo[] = [
	{
		code: "BR",
		name: "Brasil",
		ddi: "+55",
		flag: "🇧🇷",
		placeholder: "(27) 99999-8888",
		mask: (val: string) => {
			const clean = val.replace(/\D/g, "").slice(0, 11);
			if (clean.length <= 2) return clean.length ? "(" + clean : "";
			if (clean.length <= 6) return "(" + clean.slice(0, 2) + ") " + clean.slice(2);
			if (clean.length <= 10) return "(" + clean.slice(0, 2) + ") " + clean.slice(2, 6) + "-" + clean.slice(6);
			return "(" + clean.slice(0, 2) + ") " + clean.slice(2, 7) + "-" + clean.slice(7, 11);
		},
	},
	{
		code: "US",
		name: "Estados Unidos",
		ddi: "+1",
		flag: "🇺🇸",
		placeholder: "(555) 000-0000",
		mask: (val: string) => {
			const clean = val.replace(/\D/g, "").slice(0, 10);
			if (clean.length <= 3) return clean.length ? "(" + clean : "";
			if (clean.length <= 6) return "(" + clean.slice(0, 3) + ") " + clean.slice(3);
			return "(" + clean.slice(0, 3) + ") " + clean.slice(3, 6) + "-" + clean.slice(6, 10);
		},
	},
	{
		code: "PT",
		name: "Portugal",
		ddi: "+351",
		flag: "🇵🇹",
		placeholder: "912 345 678",
		mask: (val: string) => {
			const clean = val.replace(/\D/g, "").slice(0, 9);
			if (clean.length <= 3) return clean;
			if (clean.length <= 6) return clean.slice(0, 3) + " " + clean.slice(3);
			return clean.slice(0, 3) + " " + clean.slice(3, 6) + " " + clean.slice(6, 9);
		},
	},
	{ code: "ES", name: "Espanha", ddi: "+34", flag: "🇪🇸", placeholder: "612 345 678" },
	{ code: "AR", name: "Argentina", ddi: "+54", flag: "🇦🇷", placeholder: "11 1234-5678" },
	{ code: "CA", name: "Canadá", ddi: "+1", flag: "🇨🇦", placeholder: "(555) 000-0000" },
	{ code: "GB", name: "Reino Unido", ddi: "+44", flag: "🇬🇧", placeholder: "7911 123456" },
	{ code: "FR", name: "França", ddi: "+33", flag: "🇫🇷", placeholder: "6 12 34 56 78" },
	{ code: "DE", name: "Alemanha", ddi: "+49", flag: "🇩🇪", placeholder: "151 12345678" },
	{ code: "IT", name: "Itália", ddi: "+39", flag: "🇮🇹", placeholder: "312 345 6789" },
];

export function AuthGate({ children }: { children: React.ReactNode }) {
	const [session, setSession] = useState<Session | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	// Estado de Telefone Obrigatório
	const [needsPhone, setNeedsPhone] = useState(false);
	const [checkingPhone, setCheckingPhone] = useState(false);
	const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(COUNTRIES[0]);
	const [phoneDigits, setPhoneDigits] = useState("");
	const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
	const [submittingPhone, setSubmittingPhone] = useState(false);

	// Form states
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);

	const checkUserPhone = async (currentUser: User) => {
		// Se for superadmin master, não bloqueia
		if (currentUser.email === "contato@publicidadees.com.br") {
			setNeedsPhone(false);
			return;
		}

		setCheckingPhone(true);
		try {
			const { data: profile } = await supabase
				.from("profiles")
				.select("telefone, whatsapp")
				.eq("id", currentUser.id)
				.maybeSingle();

			const phone = profile?.telefone || profile?.whatsapp || (currentUser.user_metadata as any)?.telefone;
			if (!phone || String(phone).trim().length < 8) {
				setNeedsPhone(true);
			} else {
				setNeedsPhone(false);
			}
		} catch (err) {
			console.warn("Aviso ao checar telefone:", err);
			setNeedsPhone(false);
		} finally {
			setCheckingPhone(false);
		}
	};

	useEffect(() => {
		// 1. Processar hash tokens de SSO (ex: #access_token=...&refresh_token=...)
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
							void checkUserPhone(data.session.user);
							// Limpa os tokens da URL para segurança e estética
							window.history.replaceState(null, "", window.location.pathname + window.location.search);
							toast.success("Login efetuado com sucesso!", {
								description: "Sessão unificada da Publicidade ES autorizada.",
							});
						}
					})
					.catch((err) => {
						console.error("Erro no SSO hash:", err);
					});
			}
		}

		// 2. Checagem inicial de sessão existente
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
			setUser(session?.user ?? null);
			if (session?.user) {
				void checkUserPhone(session.user);
			}
			setLoading(false);
		});

		// 3. Listener de mudanças de autenticação
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			setUser(session?.user ?? null);
			if (session?.user) {
				void checkUserPhone(session.user);
			} else {
				setNeedsPhone(false);
			}
			setLoading(false);
		});

		return () => subscription.unsubscribe();
	}, []);

	// Login com Google usando o SSO Bridge Universal do Publicidade ES
	const handleGoogleLogin = () => {
		setGoogleLoading(true);
		const studioDestination =
			typeof window !== "undefined"
				? window.location.href
				: "https://studio.publicidadees.com.br/projects";
		const bridgeUrl = `https://publicidadees.com.br/login?next=${encodeURIComponent(studioDestination)}&trigger=google`;
		window.location.href = bridgeUrl;
	};

	// Login com E-mail e Senha direto no Studio
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
				if (data.user) {
					await checkUserPhone(data.user);
				}
			}
		} catch (error: any) {
			toast.error("Erro inesperado", {
				description: error.message || "Verifique sua conexão e tente novamente.",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	// Confirmação do Telefone/WhatsApp Obrigatório
	const handleSavePhone = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return;

		const cleanNumbers = phoneDigits.replace(/\D/g, "");
		const minDigits = selectedCountry.code === "BR" ? 10 : 7;
		if (cleanNumbers.length < minDigits) {
			toast.error("Número incompleto", {
				description: `Digite o número completo com DDD/código de área para ${selectedCountry.name}.`,
			});
			return;
		}

		const fullPhone = selectedCountry.ddi + cleanNumbers;
		setSubmittingPhone(true);

		try {
			// 1. Atualizar profiles
			const { error: profileErr } = await supabase
				.from("profiles")
				.update({
					telefone: fullPhone,
					whatsapp: fullPhone,
					updated_at: new Date().toISOString(),
				})
				.eq("id", user.id);

			if (profileErr) {
				console.warn("Notice updating profiles:", profileErr.message);
			}

			// 2. Atualizar platform_users (CRM)
			const meta = user.user_metadata || {};
			const userNome = meta.full_name || meta.name || user.email?.split("@")[0] || "Criador";
			const userSobrenome = meta.family_name || "";

			try {
				await (supabase as any).from("platform_users").upsert(
					[
						{
							email: user.email?.toLowerCase().trim(),
							nome: userNome,
							sobrenome: userSobrenome,
							telefone: fullPhone,
							tipo_conta: "individual",
							status: "ativo",
							updated_at: new Date().toISOString(),
						},
					],
					{ onConflict: "email" },
				);
			} catch (crmErr) {
				console.warn("Notice updating platform_users:", crmErr);
			}

			// 3. Atualizar metadados de autenticação
			await supabase.auth
				.updateUser({
					data: { telefone: fullPhone, whatsapp: fullPhone },
				})
				.catch(() => {});

			toast.success("WhatsApp confirmado!", {
				description: "Seu acesso ao ES Cut Studio foi liberado com sucesso.",
			});

			setNeedsPhone(false);
		} catch (err: any) {
			toast.error("Erro ao salvar telefone", {
				description: err.message || "Tente novamente.",
			});
		} finally {
			setSubmittingPhone(false);
		}
	};

	const signOut = async () => {
		await supabase.auth.signOut();
		setSession(null);
		setUser(null);
		setNeedsPhone(false);
		toast.info("Você saiu da conta.");
	};

	if (loading || checkingPhone) {
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

	// 1. Tela de Login Obrigatório caso não autenticado
	if (!user) {
		const cadastroUrl =
			typeof window !== "undefined"
				? `https://publicidadees.com.br/cadastro?next=${encodeURIComponent(window.location.href)}`
				: "https://publicidadees.com.br/cadastro";

		return (
			<div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
				<div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

				<div className="w-full max-w-md relative z-10 space-y-6">
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

					<div className="p-6 sm:p-7 rounded-2xl border border-border bg-card/90 backdrop-blur-md shadow-xl space-y-5">
						{/* Google Login via SSO Bridge */}
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

						<div className="relative flex items-center justify-center">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-border" />
							</div>
							<span className="relative px-3 bg-card text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
								ou com e-mail e senha
							</span>
						</div>

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
								className="w-full h-11 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md gap-2 cursor-pointer"
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

					<div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
						<ShieldCheck className="size-3.5 text-emerald-500" />
						<span>Autenticação criptografada protegida pela Publicidade ES</span>
					</div>
				</div>
			</div>
		);
	}

	// 2. Modal Bloqueante: Telefone/WhatsApp Obrigatório
	if (needsPhone) {
		const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const raw = e.target.value;
			if (selectedCountry.mask) {
				setPhoneDigits(selectedCountry.mask(raw));
			} else {
				const clean = raw.replace(/[^\d\s-]/g, "").slice(0, 16);
				setPhoneDigits(clean);
			}
		};

		return (
			<div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
				<div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

				<div className="w-full max-w-md relative z-10 space-y-6">
					<div className="text-center space-y-2">
						<div className="inline-flex size-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary items-center justify-center p-3 mb-1">
							<Phone className="size-7 text-primary" />
						</div>
						<div className="flex items-center justify-center gap-2">
							<span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
								Etapa Obrigatória
							</span>
						</div>
						<h2 className="text-2xl font-bold tracking-tight text-foreground">
							Informe seu WhatsApp
						</h2>
						<p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
							O ES Cut Studio é 100% gratuito. Para liberar seu acesso ao editor e conectar à comunidade de criadores, confirme seu número de WhatsApp:
						</p>
					</div>

					<div className="p-6 sm:p-7 rounded-2xl border border-border bg-card/90 backdrop-blur-md shadow-xl space-y-5">
						<form onSubmit={handleSavePhone} className="space-y-4">
							<div className="space-y-1.5 text-left">
								<Label className="text-xs font-medium text-foreground">
									País & DDI
								</Label>
								<div className="relative">
									<button
										type="button"
										onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
										className="w-full h-10 px-3 flex items-center justify-between rounded-md border border-input bg-background text-sm cursor-pointer hover:bg-accent"
									>
										<span className="flex items-center gap-2">
											<span>{selectedCountry.flag}</span>
											<span className="font-medium text-foreground">{selectedCountry.name}</span>
										</span>
										<span className="text-xs text-primary font-mono font-semibold">
											{selectedCountry.ddi}
										</span>
									</button>

									{isCountryDropdownOpen && (
										<div className="absolute top-11 left-0 w-full max-h-48 overflow-y-auto bg-card border border-border rounded-lg shadow-xl z-50 p-1 space-y-0.5">
											{COUNTRIES.map((c) => (
												<button
													key={c.code}
													type="button"
													onClick={() => {
														setSelectedCountry(c);
														setIsCountryDropdownOpen(false);
														setPhoneDigits("");
													}}
													className="w-full px-2.5 py-1.5 text-left text-xs rounded flex items-center justify-between hover:bg-accent cursor-pointer"
												>
													<span className="flex items-center gap-2">
														<span>{c.flag}</span>
														<span>{c.name}</span>
													</span>
													<span className="text-muted-foreground font-mono">{c.ddi}</span>
												</button>
											))}
										</div>
									)}
								</div>
							</div>

							<div className="space-y-1.5 text-left">
								<Label htmlFor="phone" className="text-xs font-medium text-foreground">
									Número com DDD
								</Label>
								<div className="relative">
									<Phone className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
									<Input
										id="phone"
										type="tel"
										required
										autoFocus
										value={phoneDigits}
										onChange={handlePhoneChange}
										placeholder={selectedCountry.placeholder}
										className="pl-9 text-sm h-10"
									/>
								</div>
							</div>

							<Button
								type="submit"
								disabled={submittingPhone}
								className="w-full h-11 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md gap-2 cursor-pointer"
							>
								{submittingPhone ? (
									<Loader2 className="size-4 animate-spin text-primary-foreground" />
								) : (
									<>
										<span>Confirmar e Acessar o Editor</span>
										<CheckCircle2 className="size-4" />
									</>
								)}
							</Button>
						</form>

						<div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/50">
							<span className="text-[11px]">Conectado como {user.email}</span>
							<button
								type="button"
								onClick={signOut}
								className="text-destructive hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
							>
								<LogOut className="size-3" />
								<span>Sair</span>
							</button>
						</div>
					</div>

					<div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
						<ShieldCheck className="size-3.5 text-emerald-500" />
						<span>Seus dados são protegidos e confidenciais pela Publicidade ES</span>
					</div>
				</div>
			</div>
		);
	}

	// 3. Usuário autenticado e com telefone validado -> Libera a aplicação
	return (
		<AuthContext.Provider value={{ user, session, loading, signOut }}>
			{children}
		</AuthContext.Provider>
	);
}
