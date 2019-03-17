<script>
	export let things;
</script>

<ul>
	{#each things as thing}
		<li>{thing}</li>
	{/each}
</ul>