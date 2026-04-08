<script>
	import Counter from './Counter.svelte';

	let items = $state([
		{ id: 'a' },
		{ id: 'b' },
		{ id: 'c' }
	]);
</script>

{#each items as item (item.id)}
	<div data-id={item.id}><Counter /></div>
{/each}
