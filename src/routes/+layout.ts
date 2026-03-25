import { siteMeta } from "$lib/site-meta";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = ({ url }) => {
	const siteUrl = url.origin;
	const canonical = new URL(url.pathname, siteUrl).href;
	const ogImage = new URL(siteMeta.ogImagePath, siteUrl).href;

	return {
		title: siteMeta.title,
		description: siteMeta.description,
		siteName: siteMeta.siteName,
		canonical,
		ogImage,
		ogImageWidth: siteMeta.ogImageWidth,
		ogImageHeight: siteMeta.ogImageHeight,
	};
};
