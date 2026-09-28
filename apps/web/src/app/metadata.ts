import type { Metadata } from "next";
import { SITE_INFO, SITE_URL } from "@/site/brand";

export const baseMetaData: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: SITE_INFO.title,
	description: SITE_INFO.description,
	openGraph: {
		title: SITE_INFO.title,
		description: SITE_INFO.description,
		url: SITE_URL,
		siteName: SITE_INFO.title,
		locale: "en_US",
		type: "website",
		images: [
			{
				url: SITE_INFO.openGraphImage,
				width: 1200,
				height: 630,
				alt: "OpenCut Wordmark",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: SITE_INFO.title,
		description: SITE_INFO.description,
		creator: "@opencutapp",
		images: [SITE_INFO.twitterImage],
	},
	pinterest: {
		richPin: false,
	},
	robots: {
		index: true,
		follow: true,
	},
	icons: {
		icon: [
			{ url: "/favicon.svg", type: "image/svg+xml" },
			{ url: "/favicon.ico", sizes: "any" },
			{ url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
			{ url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/icons/favicon-96x96.png", sizes: "96x96", type: "image/png" },
		],
		apple: [
			{ url: "/icons/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
		],
		shortcut: ["/favicon.ico"],
	},
	appleWebApp: {
		capable: true,
		title: SITE_INFO.title,
	},
	manifest: "/manifest.json",
	other: {
		"msapplication-config": "/browserconfig.xml",
	},
};
