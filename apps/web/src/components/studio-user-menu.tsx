"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStudioAuth } from "@/components/auth-gate";
import { supabase } from "@/services/supabase-client";
import { MessageCircle, LogOut, ArrowUpRight } from "lucide-react";

export function StudioUserMenu() {
	const { user, signOut } = useStudioAuth();
	const [whatsappUrl, setWhatsappUrl] = useState("https://publicidadees.com.br/comunidade");

	useEffect(() => {
		supabase
			.from("community_settings")
			.select("upsell_subtitulo, redes_sociais")
			.eq("id", "studio")
			.maybeSingle()
			.then(({ data }) => {
				if (data?.upsell_subtitulo && data.upsell_subtitulo.startsWith("http")) {
					setWhatsappUrl(data.upsell_subtitulo);
				} else if (Array.isArray(data?.redes_sociais) && (data.redes_sociais[0] as any)?.url) {
					setWhatsappUrl((data.redes_sociais[0] as any).url);
				}
			})
			.catch(() => {});
	}, []);

	if (!user) return null;

	const name =
		user.user_metadata?.full_name ||
		user.user_metadata?.name ||
		user.email?.split("@")[0] ||
		"Criador";
	const avatarUrl = user.user_metadata?.avatar_url;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="sm" className="h-9 gap-2 px-2 rounded-lg cursor-pointer">
					{avatarUrl ? (
						<img
							src={avatarUrl}
							alt={name}
							className="size-6 rounded-full object-cover border border-border"
						/>
					) : (
						<div className="size-6 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
							{name[0].toUpperCase()}
						</div>
					)}
					<span className="text-xs font-medium hidden lg:inline max-w-[110px] truncate text-foreground">
						{name}
					</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<div className="p-2 border-b border-border/50">
					<p className="text-xs font-semibold truncate text-foreground">{name}</p>
					<p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
				</div>
				<a
					href={whatsappUrl}
					target="_blank"
					rel="noopener noreferrer"
				>
					<DropdownMenuItem className="text-emerald-500 cursor-pointer">
						<MessageCircle className="size-4 mr-2" />
						Comunidade WhatsApp
					</DropdownMenuItem>
				</a>
				<Link
					href="https://publicidadees.com.br/app"
					target="_blank"
					rel="noopener noreferrer"
				>
					<DropdownMenuItem className="cursor-pointer">
						<ArrowUpRight className="size-4 mr-2" />
						Portal Publicidade ES
					</DropdownMenuItem>
				</Link>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer">
					<LogOut className="size-4 mr-2" />
					Sair da Conta
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
