<script>
	import App from './src/App.svelte';
</script>

<svelte:boundary>
	<App />

	{#snippet pending()}{/snippet}
</svelte:boundary>
