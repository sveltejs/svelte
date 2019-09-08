<script>
	import { writable } from 'svelte/store';

	const items = writable([
		 { id: 0, text: 'inital' }
	]);
</script>

{#each $items as { text }, index}
	<input bind:value={text}>
{/each}

<p>{$items[0].text}</p>