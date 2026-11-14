<script>
	import { registry } from './registry.svelte.js';
	import C from './C.svelte';

	$effect(() => {
		console.log('B mounted');
	});
</script>

{#if registry.current}
	<C />
{:else}
	<p>B — no registration, no C</p>
{/if}
