<script>
	export let visible;

	function foo(node, params) {
		return {
			duration: 100,
			tick: t => {
				node.foo = t * params.k;
			}
		};
	}
</script>

{#if visible}
	<div in:foo='{{k: 200}}'>fades in</div>
{/if}