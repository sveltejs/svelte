<script>
	const first = await Promise.resolve(1);

	// declared after an `await`, but it reads `b` through a function
	const a = $derived(get());

	function get() {
		return b;
	}

	const b = $derived(await Promise.resolve(first + 41));
</script>

<p>{a}</p>
