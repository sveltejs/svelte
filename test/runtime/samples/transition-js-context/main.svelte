<script>
	export let x = 42;
	export let visible = false;

	function foo(node, params) {
		return {
			duration: 100,
			tick: t => {
				node.foo = x;
			}
		};
	}
</script>

{#if visible}
	<div transition:foo></div>
{/if}