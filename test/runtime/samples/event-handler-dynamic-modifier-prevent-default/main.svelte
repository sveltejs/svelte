<script>
	export let default_was_prevented;
	let f;

	function handle_click(event) {
		default_was_prevented = event.defaultPrevented;
	}
	f = handle_click;
</script>

<button on:click|preventDefault={f}>click me</button>