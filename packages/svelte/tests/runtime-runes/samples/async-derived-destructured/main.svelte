<script>
	import Child from './Child.svelte';
</script>

<svelte:boundary>
	<Child />

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
