<script>
	let visible = false;

	function foo() {
		return {
			duration: 100,
			css: (t) => {
				return `scale: ${t}`;
			},
			tick: (t) => {
				console.log(`tick: ${t}`);
			}
		};
	}
</script>

<button on:click={() => (visible = !visible)}>toggle</button>

{#if visible}
	<div transition:foo></div>
{/if}
