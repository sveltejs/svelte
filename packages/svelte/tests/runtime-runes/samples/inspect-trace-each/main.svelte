<script>
	import Entry from './Entry.svelte';

	let array = $state([{ id: 1, hi: true }]);
</script>

<button onclick={() => array = [{ id: 1, hi: false}]}>update</button>

{#each array as entry (entry.id)}
	<Entry {entry} />
{/each}
