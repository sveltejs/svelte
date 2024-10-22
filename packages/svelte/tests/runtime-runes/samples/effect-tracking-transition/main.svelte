<script>
	let visible = $state(0);

	function customTransition() {
		console.log($effect.tracking());
	}
</script>

<button onclick={() => visible = !visible}>Toggle</button>

{#if visible}
	<div transition:customTransition>clicks</div>
{/if}
