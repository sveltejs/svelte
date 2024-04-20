<script>
	/** @param {HTMLInputElement} node */
	function action(node) {
		node.value = 'set from action';
	}
</script>

<input use:action>
<svelte:element this={'input'} use:action />
