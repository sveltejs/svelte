<script>
	export let default_was_prevented;

	function handle_click(event) {
		default_was_prevented = event.defaultPrevented;
	}
</script>

<button on:click|preventDefault={handle_click}>click me</button>