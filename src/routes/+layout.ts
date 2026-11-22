import { siteMeta } from "#lib/site-meta.ts";
import type { LayoutLoad } from "./$types";

// All content is static, so serve prebuilt HTML from the CDN instead of running the Worker per request.
export const prerender = true;

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
