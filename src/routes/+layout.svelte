<script lang="ts">
	const { children } = $props();
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
</script>

<svelte:head>
	<title>Skyswipe</title>
	<meta property="og:site_name" content="Skyswipe" />
	<meta name="description" content="Judge your Bluesky posts in a dating-app format." />
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
