<script>
	export let visible;

	function foo(node, params) {
		return {
			duration: 100,
			tick: (t) => {
				node.foo = t;
			},
			condition: () => true
		};
	}
</script>

{#if visible}
	<div transition:foo />
{/if}
