<script>
	export let x;
	export let y;

	function foo(node, params) {
		return {
			duration: 100,
			tick: t => {
				node.foo = t;
			}
		};
	}
</script>

{#if x}
	{#if y}
		<div transition:foo>snaps if x changes</div>
		<div transition:foo|global>transitions if x changes</div>
	{/if}
{/if}