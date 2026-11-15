<script lang="ts">
	import A from './A.svelte';
	import B from './B.svelte';
	import { registry } from './registry.svelte.js';

	let show_a = $state(true);
</script>

<button onclick={() => (show_a = !show_a)}>swap</button>

<output>
	{#if show_a}
		<A />
	{:else}
		<B />
	{/if}
</output>

<p id="current">current: {registry.current ? registry.current.name : 'null'}</p>
