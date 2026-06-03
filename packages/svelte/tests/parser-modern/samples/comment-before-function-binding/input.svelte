<script>
	let value = '';
</script>

<input bind:value={
	/** ( */
	() => value,
	(v) => value = v.toLowerCase()
}
/>
