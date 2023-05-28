<script>
	export let x;
	export let things;

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
	{#each things as thing (thing)}
		<div transition:foo|local></div>
	{/each}
{/if}