<script>
	export let visible;
	export let name;

	function foo(node, params) {
		global.count += 1;
		return {
			duration: 100,
			tick: t => {
				node.foo = t;
			}
		};
	}
</script>

{#if visible}
	<div transition:foo>hello {name}!</div>
{/if}