<script>
	import OnThisPage from './OnThisPage.svelte';

	export let data;
</script>

<svelte:head>
	<title>{data.page.title} - Svelte</title>
</svelte:head>

<div class="text">
	{@html data.page.content}
</div>

<OnThisPage details={data.page} />
