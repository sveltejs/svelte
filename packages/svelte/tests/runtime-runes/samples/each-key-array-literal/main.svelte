<script>
	let things = $state([
		{ group: 1, id: 1, name: 'apple' },
		{ group: 1, id: 2, name: 'banana' },
		{ group: 2, id: 1, name: 'carrot' },
		{ group: 2, id: 2, name: 'doughnut' },
		{ group: 3, id: 5, name: 'egg' }
	]);
</script>

<button onclick={() => things.shift()}>Remove first thing</button>

<ul>
	{#each things as thing ([thing.group, thing.id])}
		<li>{thing.name}</li>
	{/each}
</ul>
