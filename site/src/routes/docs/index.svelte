<script context="module">
	export async function preload() {
		const sections = await this.fetch(`docs.json`).then(r => r.json());
		return { sections };
	}
</script>

<script>
	import { Docs } from '@sveltejs/site-kit';

	export let sections;
</script>

<svelte:head>
	<title>API Docs • Svelte</title>

	<meta name="twitter:title" content="Svelte API docs">
	<meta name="twitter:description" content="Cybernetically enhanced web apps">
	<meta name="Description" content="Cybernetically enhanced web apps">
</svelte:head>

<h1 class="visually-hidden">API Docs</h1>
<Docs {sections}/>
