"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogDescription,
	DialogBody,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DEFAULT_LOGO_URL } from "@/site/brand";
import { ShieldCheck, Cpu, ExternalLink, Sparkles, CheckCircle2 } from "lucide-react";

export function WelcomeTermsModal() {
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		try {
			const accepted = localStorage.getItem("es_cut_terms_accepted");
			if (!accepted) {
				setIsOpen(true);
			}
		} catch {
			// localStorage blocked or restricted
		}
	}, []);

	const handleConfirm = () => {
		try {
			localStorage.setItem("es_cut_terms_accepted", "true");
		} catch {
			// ignore
		}
		setIsOpen(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="max-w-xl p-0 overflow-hidden border-border bg-background shadow-2xl">
				{/* Top Branding Banner */}
				<div className="bg-gradient-to-r from-amber-500/15 via-primary/20 to-amber-500/10 border-b border-border/60 p-6 pb-5 flex items-center gap-4">
					<div className="size-14 rounded-xl bg-background border border-border shadow-md flex items-center justify-center p-2.5 shrink-0">
						<Image
							src={DEFAULT_LOGO_URL}
							alt="Publicidade ES Logo"
							width={44}
							height={44}
							className="object-contain"
						/>
					</div>
					<div>
						<div className="flex items-center gap-2 mb-1">
							<span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/40">
								Ferramenta Gratuita
							</span>
							<span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
								Código Aberto
							</span>
						</div>
						<DialogTitle className="text-xl font-bold tracking-tight text-foreground">
							Bem-vindo ao ES Cut Studio
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground mt-0.5">
							Editor de Vídeo Profissional 100% no seu Navegador
						</DialogDescription>
					</div>
				</div>

				{/* Modal Body */}
				<DialogBody className="p-6 pt-4 flex flex-col gap-4 text-sm text-foreground/90">
					<div className="p-3.5 rounded-lg bg-accent/40 border border-border/60 text-xs text-muted-foreground leading-relaxed">
						O <strong className="text-foreground">ES Cut</strong> é uma ferramenta gratuita disponibilizada pela{" "}
						<strong className="text-foreground">Publicidade ES</strong> para toda a comunidade de criadores, estudantes e produtores capixabas. Esta versão foi desenvolvida com base no projeto de código aberto{" "}
						<Link
							href="https://github.com/opencut-app/opencut"
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:underline font-semibold inline-flex items-center gap-0.5"
						>
							OpenCut Classic <ExternalLink className="size-3 inline" />
						</Link>
						, respeitando integralmente as licenças livres de software.
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div className="p-3.5 rounded-lg border border-border/60 bg-card/60 flex flex-col gap-1.5">
							<div className="flex items-center gap-2 text-primary font-semibold text-xs">
								<ShieldCheck className="size-4 shrink-0 text-emerald-500" />
								<span>Zero Servidor & Privacidade Total</span>
							</div>
							<p className="text-xs text-muted-foreground leading-relaxed">
								Seus vídeos <strong className="text-foreground">nunca sobem para a internet</strong> ou para nossos servidores. Todo o corte, processamento e exportação ocorrem 100% no hardware do seu próprio computador.
							</p>
						</div>

						<div className="p-3.5 rounded-lg border border-border/60 bg-card/60 flex flex-col gap-1.5">
							<div className="flex items-center gap-2 text-primary font-semibold text-xs">
								<Cpu className="size-4 shrink-0 text-amber-500" />
								<span>Dica de Desempenho Local</span>
							</div>
							<p className="text-xs text-muted-foreground leading-relaxed">
								Como a renderização utiliza a memória RAM e placa de vídeo da sua máquina (via WebAssembly), recomendamos vídeos de até <strong className="text-foreground">1 GB</strong> para máxima fluidez.
							</p>
						</div>
					</div>

					<div className="p-3 rounded-lg border border-border/40 bg-muted/20 flex items-start gap-2.5">
						<CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
						<div className="text-xs text-muted-foreground leading-relaxed">
							Ao continuar, você concorda com o uso livre e declara estar ciente de que a edição ocorre localmente em seu navegador, sendo o único responsável pelos arquivos e conteúdos produzidos.
						</div>
					</div>
				</DialogBody>

				{/* Modal Footer */}
				<DialogFooter className="p-6 pt-2 pb-5 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/20">
					<span className="text-[11px] text-muted-foreground hidden sm:inline">
						Este aviso é exibido apenas na sua primeira visita.
					</span>
					<Button
						onClick={handleConfirm}
						className="w-full sm:w-auto font-semibold px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
						size="lg"
					>
						<Sparkles className="size-4 mr-1.5" />
						Concordar e Acessar o Editor
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
