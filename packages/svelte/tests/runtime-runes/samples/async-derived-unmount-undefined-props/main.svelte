<script>
	import Child from './Child.svelte';

	// This async derived in parent triggers the bug
	const something = $derived(await Promise.resolve('test'));

	let active = $state('some-id');
</script>

{#if active}
	<Child id={active} />
{/if}

<button onclick={() => active = undefined}>close</button>
