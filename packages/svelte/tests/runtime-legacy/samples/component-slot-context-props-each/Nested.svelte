<script>
	let keys = ['a', 'b'];

	function setKey(key, value) {
		console.log(`setKey(${key}, ${value})`);
	}
</script>

{#each keys as key (key)}
	<slot {key} set={(value) => setKey(key, value)} />
{/each}
