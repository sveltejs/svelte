<script>
	export let clicked;

	function handle_click(event) {
		clicked = true;
	}
</script>

<div on:click|nonself={handle_click}>
	<button>click me</button>
</div>
