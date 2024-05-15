<script>
	import Button from "./button.svelte";

	export let default_was_prevented;

	function handle_click(event) {
		default_was_prevented = event.defaultPrevented;
	}
</script>

<Button on:click={handle_click} />