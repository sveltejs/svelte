<script>
	await Promise.resolve();
	$effect(() => {
		// removed async effect
		const entries = /* @__PURE__ */ Object.create(null);
	});
	$effect.pre(() => {
		const entries = /* #__PURE__ */ Object.create(null);
	});
	// keep current
	function current() {
		return /* @__PURE__ */ Object.create(null);
	}
</script>

<p>{current()}</p>
