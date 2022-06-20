<script>
	export let items = [
		{ description: 'one', completed: false },
		{ description: 'two', completed: false },
		{ description: 'three', completed: false }
	];
	export let currentFilter = 'completed';

	function filter(item, currentFilter) {
		if ( currentFilter === 'all' ) return true;
		if ( currentFilter === 'completed' ) return item.completed;
		if ( currentFilter === 'active' ) return !item.completed;
	}
</script>

<ul>
	{#each items as item}
		{#if filter(item, currentFilter)}
			<li>{item.description}</li>
		{/if}
	{/each}
</ul>
