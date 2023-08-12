<script>
	import { writable } from 'svelte/store';

	let itemStore = writable({prop: {things: [{name: "item store"}]}});
</script>

{#each $itemStore.prop.things as thing }
	<input bind:value={thing.name} >
{/each}

<p>{$itemStore.prop.things[0].name}</p>