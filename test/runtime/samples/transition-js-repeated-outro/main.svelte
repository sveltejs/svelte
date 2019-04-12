<script>
	export let number = 11;

	function foo(node, params) {
		return {
			duration: 100,
			tick: t => {
				node.foo = t;
			}
		};
	}
</script>

{#if number > 10}
	<span out:foo>hello</span>
{/if}