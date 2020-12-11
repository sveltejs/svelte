<script>
	import Thing from './Thing.svelte';

	let things = [
		{ id: 1, color: 'darkblue' },
		{ id: 2, color: 'indigo' },
		{ id: 3, color: 'deeppink' },
		{ id: 4, color: 'salmon' },
		{ id: 5, color: 'gold' }
	];

	function handleClick() {
		things = things.slice(1);
	}
</script>

<button on:click={handleClick}>
	Remove first thing
</button>

<div style="display: grid; grid-template-columns: 1fr 1fr; grid-gap: 1em">
	<div>
		<h2>Keyed</h2>
		{#each things as thing (thing.id)}
			<Thing current={thing.color}/>
		{/each}
	</div>

	<div>
		<h2>Unkeyed</h2>
		{#each things as thing}
			<Thing current={thing.color}/>
		{/each}
	</div>
</div>
