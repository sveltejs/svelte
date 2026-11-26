<svelte:options customRenderer={null} />

<script>
	import Child from './Child.svelte';
</script>

<svelte:boundary>
	<Child></Child>

	{#snippet failed(error)}
		<p>{error.message}</p>
	{/snippet}
</svelte:boundary>
