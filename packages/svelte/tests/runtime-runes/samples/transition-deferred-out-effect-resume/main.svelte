<script>
	let show = $state(true);

	$effect(() => {
		if (!show) show = true;
	});

	/** @param {Element} node */
	function deferred(node) {
		return () => ({
			duration: 100,
			css: (t) => `opacity: ${t}`
		});
	}
</script>

<button onclick={() => (show = false)}>hide</button>

{#if show}
	<p out:deferred>hello</p>
{/if}
