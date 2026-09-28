"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Sparkles, ShieldCheck, Film } from "lucide-react";
import { useLocalStorage } from "@/services/storage/use-local-storage";
import { Button } from "../ui/button";
import { Dialog, DialogBody, DialogContent, DialogTitle } from "../ui/dialog";
import { DEFAULT_LOGO_URL } from "@/site/brand";

export function Onboarding() {
	const [step, setStep] = useState(0);
	const [hasSeenOnboarding, setHasSeenOnboarding] = useLocalStorage({
		key: "hasSeenOnboarding",
		defaultValue: false,
	});

	const isOpen = !hasSeenOnboarding;

	const handleNext = () => {
		if (step < 2) {
			setStep(step + 1);
		} else {
			handleClose();
		}
	};

	const handleClose = () => {
		setHasSeenOnboarding({ value: true });
	};

	const stepsData = [
		{
			badge: "Publicidade ES • Studio",
			icon: Film,
			title: "Bem-vindo ao ES Cut! 🎬",
			description:
				"Seu estúdio de edição de vídeo online, rápido e intuitivo. Corte clipes, crie Reels, Shorts e edições comerciais diretamente pelo seu navegador.",
		},
		{
			badge: "Privacidade & Desempenho",
			icon: ShieldCheck,
			title: "Edição 100% no seu Dispositivo ⚡",
			description:
				"Seus vídeos não sobem para servidores externos. Todo o processamento ocorre no seu computador. Para máxima fluidez, recomendamos arquivos de até 500 MB.",
		},
		{
			badge: "Tudo Pronto",
			icon: Sparkles,
			title: "Pronto para Criar! ✨",
			description:
				"Arraste seus vídeos para a barra lateral esquerda, monte sua linha do tempo e exporte em alta definição. Edição profissional e gratuita ao seu alcance!",
		},
	];

	const current = stepsData[step] || stepsData[0];
	const Icon = current.icon;

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[430px] p-0 overflow-hidden border border-border/80 bg-background/95 backdrop-blur-md shadow-2xl">
				<DialogTitle className="sr-only">{current.title}</DialogTitle>
				<DialogBody className="p-6 flex flex-col gap-5">
					{/* Top Header */}
					<div className="flex items-center gap-3.5">
						<div className="size-11 rounded-xl bg-background border border-border flex items-center justify-center p-2 shadow-sm shrink-0">
							<Image
								src={DEFAULT_LOGO_URL}
								alt="Publicidade ES"
								width={32}
								height={32}
								className="object-contain"
							/>
						</div>
						<div>
							<span className="text-[10px] font-bold uppercase tracking-wider text-primary">
								{current.badge}
							</span>
							<h2 className="text-base font-bold text-foreground leading-snug">
								{current.title}
							</h2>
						</div>
					</div>

					{/* Step Card */}
					<div className="p-4 rounded-xl bg-accent/40 border border-border/60 flex flex-col gap-2">
						<div className="flex items-center gap-2 text-primary font-semibold text-xs">
							<Icon className="size-4 shrink-0" />
							<span className="uppercase tracking-wide">
								Dica de Início
							</span>
						</div>
						<p className="text-sm text-muted-foreground leading-relaxed">
							{current.description}
						</p>
					</div>

					{/* Step Indicator & Actions */}
					<div className="flex items-center justify-between pt-1">
						{/* Progress Dots */}
						<div className="flex items-center gap-1.5">
							{stepsData.map((_, i) => (
								<button
									key={i}
									type="button"
									onClick={() => setStep(i)}
									aria-label={`Passo ${i + 1}`}
									className={`h-1.5 rounded-full transition-all ${
										step === i
											? "w-6 bg-primary"
											: "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
									}`}
								/>
							))}
						</div>

						{/* Buttons */}
						<div className="flex items-center gap-2">
							{step < 2 ? (
								<>
									<Button
										variant="ghost"
										size="sm"
										onClick={handleClose}
										className="text-xs text-muted-foreground hover:text-foreground"
									>
										Pular
									</Button>
									<Button
										onClick={handleNext}
										size="sm"
										className="font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 px-4 shadow-sm"
									>
										<span>Próximo</span>
										<ArrowRight className="size-3.5" />
									</Button>
								</>
							) : (
								<Button
									onClick={handleClose}
									size="sm"
									className="font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 px-5 shadow-sm"
								>
									<span>Começar a Editar</span>
									<Sparkles className="size-3.5" />
								</Button>
							)}
						</div>
					</div>
				</DialogBody>
			</DialogContent>
		</Dialog>
	);
}
