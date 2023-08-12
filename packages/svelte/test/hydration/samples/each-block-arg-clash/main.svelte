<script>
	export let things;
</script>

<ul>
	{#each things.foo as foo}
		<li>{foo}</li>
	{/each}
</ul>