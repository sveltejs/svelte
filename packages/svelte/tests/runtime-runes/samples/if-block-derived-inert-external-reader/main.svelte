<script>
	import { fade } from 'svelte/transition';
	import Inner from './Inner.svelte';

	let value = $state('hello');

	let innerComp = $state();

	// Reads Inner's derived value from outside the {#if} block, keeping it
	// connected in the reactive graph even when the branch is outroing.
	const externalView = $derived(innerComp?.getProcessed() ?? '');
</script>

{#if value}
	<div out:fade={{ duration: 100 }}>
		<Inner data={value} bind:this={innerComp} />
	</div>
{/if}

<button onclick={() => (value = undefined)}>clear</button>
<p>{externalView}</p>
