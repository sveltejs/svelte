<script>
	export let inner_clicked;
	export let outer_clicked;
	let f1;
	let f2;

	function handle_inner_click(event) {
		inner_clicked = true;
	}

	function handle_outer_click(event) {
		outer_clicked = true;
	}
	f1 = handle_inner_click;
	f2 = handle_outer_click;
</script>

<div on:click={f2}>
	<button on:click|stopPropagation={f1}>click me</button>
</div>