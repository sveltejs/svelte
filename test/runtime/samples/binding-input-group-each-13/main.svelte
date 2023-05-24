<script>
	let name = 'world';
	let current = '';
</script>

<input type="radio" name="current" bind:group={current} value={name}>

<input type="text" bind:value={current} />

<input type="text" bind:value={name} />
