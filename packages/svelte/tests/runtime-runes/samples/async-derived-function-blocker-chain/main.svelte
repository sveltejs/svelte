<script>
	const arrow = () => get();

	function get() {
		return b;
	}

	// declared before the `await`, but they read `b` through functions
	const a = $derived(arrow());
	const c = $derived(a + 1);
	const d = $derived.by(() => get() + 2);

	const b = $derived(await Promise.resolve(42));
</script>

<p>{a} {c} {d}</p>
