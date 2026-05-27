/** Default title, description, and branding for link previews (Open Graph, Twitter). */
export const siteMeta = {
	title: "Sheikh Abdullah — Backend Engineer",
	description:
		"Backend Engineer with 4 years building high-performance systems in Go, PostgreSQL, and AWS. Interactive terminal portfolio — type commands to explore experience, skills, projects, and contact.",
	siteName: "SheikhOS",
	/** Path under `/static`; used as og:image and twitter:image. */
	ogImagePath: "/og.png",
	ogImageWidth: 1200,
	ogImageHeight: 630,
} as const;
