<script>
	import Inner from './Inner.svelte';

	let value = $state('hello');

	let innerComp = $state();

	// Reads Inner's derived value from outside the {#if} block, keeping it
	// connected in the reactive graph even after the branch is destroyed.
	const externalView = $derived(innerComp?.getProcessed() ?? '');
</script>

{#if value}
	{@const result = value}
	<Inner data={result} bind:this={innerComp} />
{/if}

<button onclick={() => (value = undefined)}>clear</button>
<p>{externalView}</p>
