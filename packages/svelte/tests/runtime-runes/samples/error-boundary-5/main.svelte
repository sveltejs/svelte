<script>
	import Child from './Child.svelte';
</script>

<svelte:boundary onerror={(e) => console.log('error caught')}>
	<svelte:boundary onerror={(e) => { throw e }}>
		<svelte:boundary>
			<Child />
		</svelte:boundary>
	</svelte:boundary>

	{#snippet failed(e, retry)}
		<div>too high</div>
		<button onclick={retry}>Retry</button>
	{/snippet}
</svelte:boundary>


