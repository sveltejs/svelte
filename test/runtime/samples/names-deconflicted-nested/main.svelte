<script>
	export let array;
</script>

{#each array as row, i}
	<div>
		{#each row as cell, j}
			<span>[ {i}, {j} ]</span>
		{/each}
	</div>
{/each}
