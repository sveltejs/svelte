<script>
	export let button

	function handle_click(detail) {
		button = detail
	}
</script>

<button on:click|detail={handle_click}>click me</button>