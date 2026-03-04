<script>
	function fade(_) {
		return {
			delay: 100,
			duration: 100,
			css: (t) => `opacity: ${t}`
		};
	}

	let visible = $state(false);
</script>

<button onclick={() => (visible = !visible)}>toggle</button>

{#if visible}
	<p
		transition:fade
		onintrostart={() => console.log('introstart')}
		onintroend={() => console.log('introend')}
		onoutrostart={() => console.log('outrostart')}
		onoutroend={() => console.log('outroend')}
	>delayed fade</p>
{/if}
