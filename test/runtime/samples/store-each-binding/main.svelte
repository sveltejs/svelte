<script>
	import { writable } from 'svelte/store';

	const items = writable([
		 { id: 0, text: 'initial' }
	]);
</script>

{#each $items as item}
	<input bind:value={item.text}>
{/each}

<p>{$items[0].text}</p>