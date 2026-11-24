<script>
	let items = $state(['a', 'b', 'c']);
</script>

<button onclick={() => items.push('d')}>add item</button>

<ul>
	{#each items as item}
		<li>{item}</li>
	{/each}
</ul>
