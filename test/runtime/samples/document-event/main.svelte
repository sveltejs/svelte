<script>
	export let events = [];

	function log(event) {
		events.push(event);
	}
</script>

<svelte:body on:mouseenter='{() => log("enter")}' on:mouseleave='{() => log("leave")}'/>
