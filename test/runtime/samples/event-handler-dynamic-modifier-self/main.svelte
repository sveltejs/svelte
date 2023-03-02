<script>
	export let inner_clicked;
	let f;

	function handle_click(event) {
		inner_clicked = true;
	}
	f = handle_click;
</script>

<div on:click|self={f}>
	<button>click me</button>
</div>
