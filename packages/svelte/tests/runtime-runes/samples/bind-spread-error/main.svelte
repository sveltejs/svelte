<script>
	function getInvalidBindings() {
		return { get: 'not a function', set: 'not a function' };
	}
</script>

<input type="checkbox" bind:checked={...getInvalidBindings()} />
