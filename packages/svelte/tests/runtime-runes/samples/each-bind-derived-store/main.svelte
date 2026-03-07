<script>
	import { writable } from 'svelte/store';

	const store = writable([{ text: 'initial' }]);
	const items = $derived($store);
</script>

{#each items as item}
	<input bind:value={item.text} />
{/each}

<p>{items[0].text}</p>
