<script>
	import OnThisPage from './OnThisPage.svelte';

	/** @type {import('./$types').PageData}*/
	export let data;
</script>

<svelte:head>
	<title>{data.page.title} - Svelte</title>
</svelte:head>

<div class="text">
	{@html data.page.content}
</div>

{#if data.page.sections.length !== 0}
	<OnThisPage details={data.page} />
{/if}
