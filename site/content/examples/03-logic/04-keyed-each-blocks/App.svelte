<script>
	import Thing from './Thing.svelte';

	let things = [
		{ id: 1, value: 'a' },
		{ id: 2, value: 'b' },
		{ id: 3, value: 'c' },
		{ id: 4, value: 'd' },
		{ id: 5, value: 'e' }
	];

	function handleClick() {
		things = things.slice(1);
	}
</script>

<button on:click={handleClick}>
	Remove first thing
</button>

<div style="display: grid; grid-template-columns: 1fr 1fr; grip-gap: 1em">
	<div>
		<h2>Keyed</h2>
		{#each things as thing (thing.id)}
			<Thing value={thing.value}/>
		{/each}
	</div>

	<div>
		<h2>Unkeyed</h2>
		{#each things as thing}
			<Thing value={thing.value}/>
		{/each}
	</div>
</div>