<script>
	let array = $state([{ value: 'a' }]);
</script>

{#each array as obj}
	<input bind:value={() => obj.value, (value) => array = [{ value }]} />
	<p>{obj.value}</p>
{/each}
