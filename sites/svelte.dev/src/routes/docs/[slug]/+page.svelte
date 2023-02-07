<script>
	import OnThisPage from './OnThisPage.svelte';

	/** @type {import('./$types').PageData}*/
	export let data;
</script>

<svelte:head>
	<title>{data.page.title} - Svelte</title>
</svelte:head>

{@html data.page.content}

{#if data.page.sections.length !== 0}
	<OnThisPage details={data.page} />
{/if}
