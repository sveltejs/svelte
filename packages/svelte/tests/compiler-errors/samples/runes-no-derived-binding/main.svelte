<script>
	let a = $state(0);
	let b = $derived({ a });
</script>

<input type="number" bind:value={b} />
