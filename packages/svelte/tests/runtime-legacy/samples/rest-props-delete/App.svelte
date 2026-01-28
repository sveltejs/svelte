<script>
	function prune() {
		$$restProps.a
		delete $$restProps.a
		// should be idempotent
		delete $$restProps.a
	}
</script>

<button on:click={prune}>delete a</button>

{JSON.stringify($$restProps)}
