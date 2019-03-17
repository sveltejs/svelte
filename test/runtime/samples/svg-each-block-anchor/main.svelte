<script>
	export let foo;
	export let bar;
</script>

<svg>
	{#each foo as x}
		<g class='foo'></g>
	{/each}

	{#each bar as y}
		<g class='bar'></g>
	{/each}
</svg>