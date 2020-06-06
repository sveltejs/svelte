<script>
	const refs = ['1','2','3']
	export let callback = () => {};

	$: callback(refs);
</script>

{#each refs as ref}
	<input bind:value={ref} />
{/each}