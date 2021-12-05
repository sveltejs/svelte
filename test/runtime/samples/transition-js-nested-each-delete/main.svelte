<script>
	export let visible;
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

{#if visible}
	{#each things as thing}
		<div transition:foo>{thing}</div>
	{/each}
{/if}
