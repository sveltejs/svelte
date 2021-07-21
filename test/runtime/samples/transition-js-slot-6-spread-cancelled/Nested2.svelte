<script>
	export let visible;
	let slotProps = { slotProps: 'XXX' };

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