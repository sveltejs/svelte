<script>
	export let inner_clicked;
	export let outer_clicked;

	function handle_inner_click(event) {
		inner_clicked = true;
	}

	function handle_outer_click(event) {
		outer_clicked = true;
	}
</script>

<div on:click={handle_outer_click}>
	<button on:click|stopPropagation={handle_inner_click}>click me</button>
</div>