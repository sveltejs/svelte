<script>
	export let names = ['John', 'Jill'];
</script>

{#each names as name (name)}
	<div>
		<span>hello</span>
		{@html name}
	</div>
{/each}

