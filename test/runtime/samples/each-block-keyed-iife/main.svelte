<script>
	const arr = [1, 2, 3];
</script>

{#each arr as item ((() => item)())}
	<div>
		{item}
	</div>
{/each}
