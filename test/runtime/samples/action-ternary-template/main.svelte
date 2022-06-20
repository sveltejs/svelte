<script>
	export let display;
	export let target;

	function insert(node, text) {
		function onClick() {
			node.textContent = text;
		}
		node.addEventListener('click', onClick);

		return {
			destroy() {
				node.removeEventListener('click', onClick);
			}
		}
	}
</script>

<h1 use:insert="{display ? `Hello ${target}` : ''}"></h1>