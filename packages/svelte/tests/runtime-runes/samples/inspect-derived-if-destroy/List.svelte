<script>
	let {things} = $props();
	
	$inspect(things);
</script>

<ul>
	{#each things as thing}
		<li>thing {thing.id}</li>
	{/each}
</ul>
