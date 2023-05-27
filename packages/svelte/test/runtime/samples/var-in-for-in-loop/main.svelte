<script>
	var array = [0, 1, 2, 3, 4];
	for (var i in array) {
		array[i] = 2 * i;
	}
</script>

{#each array as a}
	<p>{a}</p>
{/each}
