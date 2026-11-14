<script>
	import A from './A.svelte';
	import B from './B.svelte';
	import { registry } from './registry.svelte.js';
	let showA = $state(true);
</script>

<button onclick={() => (showA = !showA)}>swap {showA ? 'A → B' : 'B → A'}</button>
<p>registry.current: {registry.current ? registry.current.name : 'null'}</p>

{#if showA}
	<A />
{:else}
	<B />
{/if}
