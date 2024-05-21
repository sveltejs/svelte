<script context="module">
	let visible = $state(true);

	function toggleVisibility() {
		visible = !visible;
	}

	let unchangedState = $state("unchanged state");
	let derived = $derived.by(() => {
		console.log("recalculating");
		return unchangedState;
	});
</script>

<button onclick={toggleVisibility}>Toggle Visibility</button>
{#if visible}
	<p>{derived}</p>
{/if}
