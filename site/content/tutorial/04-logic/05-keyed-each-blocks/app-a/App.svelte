<script>
	import Thing from './Thing.svelte';

	let array = [
		{ id: 1, data: 1 },
		{ id: 2, data: 2 },
		{ id: 3, data: 3 },
		{ id: 4, data: 4 },
		{ id: 5, data: 5 }
	];

	function handleClick() {
		array = array.slice(1);
	}
</script>

<button on:click={handleClick}>
	Remove first element
</button>

{#each array as element}
	<Thing current={element.data}/>
{/each}