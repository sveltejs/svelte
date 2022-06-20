<script>
	export let names = ['John', 'Jill'];
</script>

{#each names as name (name)}
	{@html name}
{/each}

