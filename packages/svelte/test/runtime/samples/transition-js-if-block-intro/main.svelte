<script>
	export let visible;

	function fade(node, params) {
		return {
			duration: 400,
			tick: t => {
				node.style.opacity = t;
			}
		};
	}
</script>

{#if visible}
	<div in:fade>fades in</div>
{/if}