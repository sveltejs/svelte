<script>
	let keys = ['a', 'b'];
  export let log;
	function setKey(key, value) {
		log.push(`setKey(${key}, ${value})`);
  }
</script>

{#each keys as key (key)}
	<slot {key} set={(value) => setKey(key, value)} />
{/each}