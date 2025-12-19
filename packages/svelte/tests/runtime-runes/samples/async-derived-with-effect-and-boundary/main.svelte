<script>
	import Child from './Child.svelte';
</script>

<svelte:boundary>
	{#snippet pending()}
		<p>Loading...</p>
	{/snippet}

	<Child />
</svelte:boundary>
