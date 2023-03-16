<script>
	export let value = 0;

	function foo(node, params) {
		return {
			duration: 100,
			tick: (t, u) => {
				node.foo = t;
				node.oof = u;
			}
		};
	}
</script>

{#key value}
	<div transition:foo>{value}</div>
{/key}