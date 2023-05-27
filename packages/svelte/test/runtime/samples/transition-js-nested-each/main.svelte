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
	{#each things as thing}
		<div transition:foo|global></div>
	{/each}
{/if}