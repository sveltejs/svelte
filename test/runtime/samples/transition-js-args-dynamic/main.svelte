<script>
	export let visible = false;
	export let value = 0;

	function foo(node, params) {
		return {
			duration: 100,
			tick: () => {
				node.value = value;
			}
		};
	}
</script>

{#if visible}
	<div transition:foo={{value}}></div>
{/if}