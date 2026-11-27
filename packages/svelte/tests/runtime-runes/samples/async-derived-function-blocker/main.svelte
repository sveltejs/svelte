<script>
	function get() {
		return b;
	}

	const a = $derived(get());
	const b = $derived(await Promise.resolve(42));
</script>

<p>{a}</p>
