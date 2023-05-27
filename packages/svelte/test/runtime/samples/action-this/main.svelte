<script>
	export let x = 0;

	function foo(node) {
		const handler = () => {
			x += 1;
		};

		node.addEventListener('click', handler);
		handler();

		return {
			destroy() {
				node.removeEventListener('click', handler);
			}
		};
	}
</script>

<button use:foo>{x}</button>