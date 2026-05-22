<script>
	import Child from './Child.svelte';
</script>

<svelte:boundary>
	<Child />

	{#snippet pending()}
		<p>Loading...</p>
	{/snippet}
</svelte:boundary>
