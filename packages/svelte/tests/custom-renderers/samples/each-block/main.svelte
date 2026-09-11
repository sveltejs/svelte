<script>
	let items = $state(['a', 'b', 'c']);
</script>

<ul>
	{#each items as item}
		<li>{item}</li>
	{/each}
</ul>
