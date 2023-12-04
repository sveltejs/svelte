<script>
	export let x;
	export let y;

	function foo(node, _params) {
		return {
			duration: 100,
			tick: t => {
				node.foo = t;
			}
		};
	}
</script>

{#if x}
	{#key y}
		<div transition:foo|local></div>
	{/key}
{/if}