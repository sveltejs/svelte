<script>
	export let visible;
	export let condition;

	function foo(node, params) {
		return {
			duration: 100,
			tick: (t) => {
				node.foo = t;
			},
			condition
		};
	}
</script>

{#if visible}
	<div transition:foo />
{/if}
