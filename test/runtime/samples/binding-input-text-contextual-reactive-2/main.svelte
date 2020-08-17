<script>
	let items = [
		{ done: false, text: 'one' },
		{ done: true, text: 'two' },
		{ done: false, text: 'three' }
	];
	export let filter = 'all';

	$: done = items.filter(item => item.done);
	$: remaining = items.filter(item => !item.done);

	$: filtered = (
		filter === 'all' ? items :
		filter === 'done' ? items.filter(item => item.done) :
		items.filter(item => !item.done)
	);

</script>

{#each filtered as item}
	<div>
		<input type="checkbox" bind:checked={item.done}>
		<input type="text" bind:value={item.text}>
		<p>{item.text}</p>
	</div>
{/each}

<p>completed {done.length}, remaining {remaining.length}, total {items.length}</p>