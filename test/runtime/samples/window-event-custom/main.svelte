<script>
	export let escaped = false;

	function esc(node, callback) {
		function onKeyDown(event) {
			if (event.key === 'Escape') callback(event);
		}
		node.addEventListener('keydown', onKeyDown);
		return {
			destroy() {
				node.removeEventListener('keydown', onKeyDown);
			}
		};
	}
</script>

<svelte:window use:esc="{() => escaped = true}" />

<p>escaped: {escaped}</p>
