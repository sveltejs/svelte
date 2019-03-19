<script>
	export let components;
</script>

<ul>
	{#each components as component}
		<li>{component}</li>
	{/each}
</ul>