<script>
	export let colours = [ 'red', 'green', 'blue' ];
</script>

<svg>
	{#each colours as colour, i}
		<circle cx='{i * 100}' cy='100' r='100' fill='{colour}'/>
	{/each}
</svg>
