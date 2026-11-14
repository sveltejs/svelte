<script lang="ts">
	import { hydratable } from 'svelte';

	let { environment } = $props();
</script>

{#if true}
	{@const a = await hydratable('a', () => Promise.resolve(environment))}
	{@const b = await hydratable('b', () => Promise.resolve(environment))}
	<p>{a} {b}</p>
{/if}
