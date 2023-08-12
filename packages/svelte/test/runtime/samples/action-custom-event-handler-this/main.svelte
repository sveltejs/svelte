<script>
	function enter(node, callback) {
		function handleKeydown(event) {
			if (event.key === 'Enter') {
				callback(event);
			}
		}

		node.addEventListener('keydown', handleKeydown);

		return {
			destroy() {
				node.removeEventListener('keydown', handleKeydown);
			}
		};
	}
</script>

<input use:enter='{e => e.target.blur()}'>
