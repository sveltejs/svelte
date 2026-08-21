<script>
	import Child from './Child.svelte';
</script>

<svelte:boundary>
	<Child />

	{#snippet pending()}{/snippet}
</svelte:boundary>
