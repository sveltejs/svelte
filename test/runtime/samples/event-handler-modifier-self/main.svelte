<script>
	export let inner_clicked;

	function handle_click(event) {
		inner_clicked = true;
	}
</script>

<div on:click|self={handle_click}>
	<button>click me</button>
</div>
