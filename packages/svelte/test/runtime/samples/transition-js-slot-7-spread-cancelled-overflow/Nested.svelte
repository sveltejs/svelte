<script>
	export let visible;
	export let slotProps;

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
		<slot {...slotProps}></slot>
	</div>
{/if}
