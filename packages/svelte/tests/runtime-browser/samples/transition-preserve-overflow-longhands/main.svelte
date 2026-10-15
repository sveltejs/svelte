<script>
	function fade() {
		return {
			duration: 50,
			css: (t) => `opacity: ${t}`
		};
	}

	function slide() {
		return {
			duration: 50,
			css: (t) => `overflow: hidden; opacity: ${t}`
		};
	}

	let visible = $state(false);
</script>

<button onclick={() => (visible = !visible)}>toggle</button>

{#if visible}
	<div style="overflow-x: auto" transition:fade>a</div>
	<div style="overflow-y: scroll" transition:slide>b</div>
{/if}
