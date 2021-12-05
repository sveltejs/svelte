<script>
	import Nested from './Nested.svelte';

	export let count;
	export let idToValue = Object.create(null);
	let ids;

	$: ids = new Array(count)
		.fill(null)
		.map((_, i) => 'id-' + i);
</script>

<input type='number' bind:value={count}>

<ol>
	{#each ids as id}
		<Nested {id} bind:value={idToValue[id]}>
			{id}: value is {idToValue[id]}
		</Nested>
	{/each}
</ol>