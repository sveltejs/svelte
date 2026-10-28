<script>
	let items = [1, 2];
</script>

{#each true, items as item, i (item)}<p>{i}: {item}</p>{/each}
