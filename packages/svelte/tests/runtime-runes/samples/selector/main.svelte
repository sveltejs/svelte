<script>
	import { selector } from 'svelte';
	let array = $state([1, 2, 3]);
	let selected = selector();
</script>

{#each array as item}
	<button on:click={() => selected.set(item)}>{selected.is(item)}</button>
{/each}

<p>{selected.current}</p>
