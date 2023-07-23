<script>
	export let clicked;
	let f;

	function handle_click(event) {
		clicked = true;
	}
	f = handle_click;
</script>

<div on:click|nonself={f}>
	<button>click me</button>
</div>
