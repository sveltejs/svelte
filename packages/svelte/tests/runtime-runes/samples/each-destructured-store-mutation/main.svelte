<script lang="ts">
	import { writable } from 'svelte/store';

	const items = writable([{ nested: { value: 1 } }]);
</script>

<button onclick={() => ($items[0].nested.value += 1)}>update</button>

<output>
	{#each $items as { nested }}
		<p>{nested.value}</p>
	{/each}
</output>
