<script>
	export let z = 10;

	function tap(node, callback) {
		const clickHandler = event => {
			callback(event);
		};

		node.addEventListener('click', clickHandler, false);

		return {
			destroy() {
				node.addEventListener('click', clickHandler, false);
			}
		};
	}
</script>

<button use:tap='{() => z += 1}'>{z}</button>
