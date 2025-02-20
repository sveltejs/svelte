<svelte:options runes />
<script>
	import { writable } from 'svelte/store';

	const array = writable([{ name: "" }]);
</script>

{#each $array as item}
	<div><input bind:value={item.name} /></div>
{/each}
