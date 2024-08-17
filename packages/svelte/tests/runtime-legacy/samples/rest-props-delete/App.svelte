<script>
	function prune() {
		$$restProps.a
		delete $$restProps.a
	}
</script>

<button on:click={prune}>delete a</button>

{JSON.stringify($$restProps)}
