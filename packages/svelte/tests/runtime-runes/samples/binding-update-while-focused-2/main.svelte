<script>
	let value = $state(0)
	const min = 2
	const max = 5

	$effect(() => {
		setValue()
	})

	function setValue() {
		if (value < min) {
			value = min
		}
		if (value > max) {
			value = max
		}
	}
</script>

<p>{value}</p>
<input type="number" bind:value />
