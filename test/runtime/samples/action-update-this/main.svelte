<script>
	export let on_destroy;
	export let text;
	function tooltip(node, text) {
		node.textContent = text;
		return {
			node,
			update(text) {
				this.node.textContent = text;
			},
			destroy() {
				on_destroy(this.node.textContent);
			},
		};
	}
</script>

<button use:tooltip={text} />
