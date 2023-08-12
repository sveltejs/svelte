<script>
	let hovering;

	function enter() {
		hovering = true;
	}

	function leave() {
		hovering = false;
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:mouseenter={enter} on:mouseleave={leave}>
	<slot {hovering} />
</div>
