<script>
	let rows = $state([
		{ name: 'a', selected: [] },
		{ name: 'b', selected: [] }
	]);

	let indexed = $state([
		{ name: 'a', selected: [] },
		{ name: 'b', selected: [] }
	]);
</script>

<button onclick={() => rows.unshift({ name: 'c', selected: [] })}>add</button>
<button onclick={() => indexed.unshift({ name: 'c', selected: [] })}>add indexed</button>

<div class="rows">
	{#each rows as row (row.name)}
		<p>
			<input type="checkbox" value="x" bind:group={row.selected} />
			<input type="checkbox" value="y" bind:group={row.selected} />
			{row.name}: {row.selected.join(',')}
		</p>
	{/each}
</div>

<div class="indexed">
	{#each indexed as row, i (row.name)}
		<p>
			<input type="checkbox" value="x" bind:group={row.selected} />
			<input type="checkbox" value="y" bind:group={row.selected} />
			{i}
			{row.name}: {row.selected.join(',')}
		</p>
	{/each}
</div>
