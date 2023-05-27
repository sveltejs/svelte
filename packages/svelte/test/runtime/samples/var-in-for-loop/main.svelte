<script>
	var array = [];
	for (var i = 0; i < 5; i++) {
		array[i] = i;
	}
</script>

{#each array as a}
	<p>{a}</p>
{/each}
