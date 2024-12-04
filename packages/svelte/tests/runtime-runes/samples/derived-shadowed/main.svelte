<script>
	let value = $derived.by(() => {
		const value = $state(0);
		return value;
	});
</script>

<div>{value}</div>
