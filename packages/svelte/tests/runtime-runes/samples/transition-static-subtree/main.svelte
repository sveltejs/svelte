<script>
	function fade(_) {
		return {
			duration: 500,
			css: t => `opacity: ${t}`,
		}
	}

	let visible = $state(true);
</script>

<button onclick={() => visible = !visible}>Toggle</button>

{#if visible}
	<div>
		<span transition:fade>123</span>
	</div>
{/if}
