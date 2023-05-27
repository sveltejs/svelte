<script>
	export let visible;
	export let duration;

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
	<div transition:foo='{{k: duration}}'>fades in</div>
{/if}