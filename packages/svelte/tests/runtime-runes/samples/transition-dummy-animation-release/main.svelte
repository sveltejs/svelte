<script>
	function fade(_) {
		return {
			duration: 100,
			css: (t) => `opacity: ${t}`
		};
	}

	let visible = $state(false);
</script>

<button onclick={() => (visible = !visible)}>toggle</button>

{#if visible}
	<p transition:fade>fade</p>
{/if}
