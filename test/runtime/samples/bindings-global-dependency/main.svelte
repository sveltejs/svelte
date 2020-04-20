<script>
	let data = {
		a: {value:''}
	}
</script>

{#each Object.values(data) as object}
	<input type="text" bind:value={object.value} />
{/each}