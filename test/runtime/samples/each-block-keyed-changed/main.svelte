<script>
	export let titles;
</script>
<div class="container">
	{#each titles as title (title.name)}
		<p>{title.name}</p>
	{/each}
</div>
