<script>
	export let items;
	export let filter = 'all';

	$: done = items.filter(item => item.done);
	$: remaining = items.filter(item => !item.done);

	$: filtered = (
		filter === 'all' ? items :
		filter === 'done' ? done :
		remaining
	);

	$: summary = items.map(i => `${i.done ? 'done' : 'remaining'}:${i.text}`).join(' / ');
</script>

{#each filtered as item}
	<div>
		<input type="checkbox" bind:checked={item.done}>
		<input type="text" bind:value={item.text}>
		<p>{item.text}</p>
	</div>
{/each}

<p>{summary}</p>