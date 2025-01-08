<script>
	import Child from './Child.svelte';
</script>

<svelte:boundary onerror={(e) => console.log('error caught')}>
	<Child />

	{#snippet failed(err, reset)}
		<div>An error occurred!</div>
		<Child />
	{/snippet}
</svelte:boundary>
