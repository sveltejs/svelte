<script>
	function get_handlers() {
		return {
			handle_click: () => {
				clicked = true;
			}
		};
	}

	let clicked = false;
	const { handle_click } = get_handlers();
</script>

<button on:click={handle_click}>
	clicked: {clicked}
</button>