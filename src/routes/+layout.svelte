<script lang="ts">
  import type { LayoutProps } from "./$types";

  let { data, children }: LayoutProps = $props();
</script>

<svelte:head>
  <title>{data.title}</title>
  <meta name="description" content={data.description} />
  <link rel="canonical" href={data.canonical} />

  <meta property="og:type" content="website" />
  <meta property="og:url" content={data.canonical} />
  <meta property="og:title" content={data.title} />
  <meta property="og:description" content={data.description} />
  <meta property="og:image" content={data.ogImage} />
  <meta property="og:image:width" content={String(data.ogImageWidth)} />
  <meta property="og:image:height" content={String(data.ogImageHeight)} />
  <meta property="og:site_name" content={data.siteName} />
  <meta property="og:locale" content="en_US" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={data.title} />
  <meta name="twitter:description" content={data.description} />
  <meta name="twitter:image" content={data.ogImage} />
</svelte:head>

{@render children()}
