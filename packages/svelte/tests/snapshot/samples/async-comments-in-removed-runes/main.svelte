<script>
	$effect(() => {
		// removed effect
		const entries = /* @__PURE__ */ Object.create(null);
	});
	const cleanup = $effect.root(() => {
		const entries = /* #__PURE__ */ Object.create(null);
	});
	$inspect(/* @__PURE__ */ Object.create(null));
	// keep current
	function current() {
		return /* @__PURE__ */ Object.create(null);
	}
</script>

<button onclick={cleanup}>{current()}</button>
