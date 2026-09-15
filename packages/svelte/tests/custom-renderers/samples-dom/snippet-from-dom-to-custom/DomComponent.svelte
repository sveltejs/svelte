<svelte:options customRenderer={null} />

<script module>
	export { greeting };
</script>

{#snippet greeting(name)}
	<span>hello {name}</span>
{/snippet}
