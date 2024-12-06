<script>
	import Child from './Child.svelte';
</script>

<svelte:boundary onerror={(e) => console.log('error caught')}>
	<!-- boundary should rethrow error as there's no control flow -->
	<svelte:boundary>
		<!-- rethrow the error in the handler -->
		<svelte:boundary onerror={e => { throw e }}>
			<Child />
		</svelte:boundary>
	</svelte:boundary>

	{#snippet failed(e, retry)}
		<div>Error!</div>
		<button onclick={retry}>Retry</button>
	{/snippet}
</svelte:boundary>


