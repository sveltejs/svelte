<script>
	import Child from './Child.svelte';
</script>

<svelte:boundary onerror={(e) => console.log('error caught')}>
	<Child />

	{#snippet failed(e, retry)}
		<div>Error!</div>
		<button onclick={retry}>Retry</button>
	{/snippet}
</svelte:boundary>


