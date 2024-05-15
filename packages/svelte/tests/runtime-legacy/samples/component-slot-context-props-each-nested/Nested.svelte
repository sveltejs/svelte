<script>
	let keys = ['a', 'b'];
	let items = ['c', 'd'];

	function setKey(key, value, item) {
		console.log(`setKey(${key}, ${value}, ${item})`);
	}
</script>

{#each items as item (item)}
	{#each keys as key (key)}
		<slot {key} {item} set={(value) => setKey(key, value, item)} />
	{/each}
{/each}
