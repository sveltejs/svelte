<script>
	export let x;
	export let promise;

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
	{#await promise then value}
		<div transition:foo></div>
	{/await}
{/if}