<script>
	/** @type {import('./$types').PageData}*/
	export let data;
</script>

<svelte:head>
	<title>{data.page.title} - Svelte</title>
</svelte:head>

{@html data.page.content}
