<script>
	export let visible;

	function fade(node) {
		return {
			duration: 100,
			tick: t => {
				node.foo = t;
			}
		};
	}
</script>

{#if visible}
	<div transition:fade>
		<slot></slot>
	</div>
{/if}