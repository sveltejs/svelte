<script>
	import Thing from './Thing.svelte';

	let things = [
		{ id: 1, color: '#3B82F6' },
		{ id: 2, color: '#10B981' },
		{ id: 3, color: '#EF4444' },
		{ id: 4, color: '#EAB308' },
	];

	function handleClick() {
		things = things.slice(1);
	}
</script>

<button on:click={handleClick}>
	Remove first thing
</button>

{#each things as thing (thing.id)}
	<Thing current={thing.color} />
{/each}