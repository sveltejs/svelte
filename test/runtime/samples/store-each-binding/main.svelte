<script>
	import { writable } from 'svelte/store';

	const items = writable([
		 { id: 0, text: 'inital' }
	]);
</script>

{#each $items as item, index}
	<input bind:value={item.text}>
{/each}

<p>{$items[0].text}</p>