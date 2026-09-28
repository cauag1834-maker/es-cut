import Link from "next/link";
import { RiDiscordFill, RiTwitterXLine } from "react-icons/ri";
import { FaGithub } from "react-icons/fa6";
import Image from "next/image";
import { DEFAULT_LOGO_URL } from "@/site/brand";
import { SOCIAL_LINKS } from "@/site/social";
import { capitalizeFirstLetter } from "@/utils/string";

type Category = "resources" | "company";

interface FooterLink {
	label: string;
	href: string;
}

type CategoryLinks = Record<Category, FooterLink[]>;

const links: CategoryLinks = {
	resources: [
		{ label: "Meus Projetos", href: "/projects" },
		{ label: "Privacidade", href: "/privacy" },
		{ label: "Termos de Uso", href: "/terms" },
	],
	company: [
		{ label: "Portal Publicidade ES", href: "https://publicidadees.com.br" },
		{ label: "Hub de Ferramentas", href: "https://publicidadees.com.br/ferramentas" },
		{ label: "Código Fonte Base (OpenCut)", href: "https://github.com/OpenCut-app/OpenCut" },
	],
};

export function Footer() {
	return (
		<footer className="bg-background border-t">
			<div className="mx-auto max-w-5xl px-8 py-10">
				<div className="mb-8 grid grid-cols-1 gap-12 md:grid-cols-2">
					{/* Brand Section */}
					<div className="max-w-sm md:col-span-1">
						<div className="mb-4 flex items-center justify-start gap-2">
							<Image
								src={DEFAULT_LOGO_URL}
								alt="ES Cut Studio"
								width={28}
								height={28}
								className="object-contain"
							/>
							<span className="text-lg font-bold">ES Cut Studio</span>
						</div>
						<p className="text-muted-foreground mb-5 text-sm md:text-left">
							O editor de vídeo profissional e 100% privado no seu navegador da Publicidade ES.
						</p>
					</div>

					<div className="flex items-start justify-start gap-12 py-2">
						{(Object.keys(links) as Category[]).map((category) => (
							<div key={category} className="flex flex-col gap-2">
								<h3 className="text-foreground font-semibold">
									{category === "resources" ? "Editor" : "Publicidade ES"}
								</h3>
								<ul className="space-y-2 text-sm">
									{links[category].map((link) => (
										<li key={link.href}>
											<Link
												href={link.href}
												className="text-muted-foreground hover:text-foreground transition-colors"
												target={
													link.href.startsWith("http") ? "_blank" : undefined
												}
												rel={
													link.href.startsWith("http")
														? "noopener noreferrer"
														: undefined
												}
											>
												{link.label}
											</Link>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>

				{/* Bottom Section */}
				<div className="flex flex-col items-start justify-between gap-4 pt-2 md:flex-row border-t border-border/40">
					<div className="text-muted-foreground flex items-center gap-4 text-sm">
						<span>
							© {new Date().getFullYear()} Publicidade ES — Baseado em Software Livre (OpenCut)
						</span>
					</div>
				</div>
			</div>
		</footer>
	);
}
