<script>
	export let items;
</script>

{#each items as item}
	{const doubled = item * 2}
	{function label(value) {
		return `value: ${value}`;
	}}
	<p>{label(doubled)}</p>
{/each}
