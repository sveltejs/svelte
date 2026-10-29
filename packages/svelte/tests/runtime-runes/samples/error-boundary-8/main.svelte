<script>
	import Child from './Child.svelte';

	let { pending } = $props();
</script>

<svelte:boundary onerror={(e) => console.log('error caught')}>
	<!-- boundary should rethrow error as there's no control flow, even with a reactive pending prop -->
	<svelte:boundary {pending}>
		<Child />
	</svelte:boundary>

	{#snippet failed(e, retry)}
		<div>Error!</div>
		<button onclick={retry}>Retry</button>
	{/snippet}
</svelte:boundary>
