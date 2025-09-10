<script module>
	import Child from './Child.svelte';
	export let route = $state({ current: 'home' });
</script>

<script>
	// reset from earlier tests
	route.current = 'home'
</script>

<button onclick={() => route.reject()}>reject</button>

<svelte:boundary>
	{#if route.current === 'home'}
		<Child />
	{:else}
		<p>route: {route.current}</p>
	{/if}

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
