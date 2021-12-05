<script>
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

{#each things as thing (thing.name)}
	<div transition:foo>{thing.name}</div>
{/each}