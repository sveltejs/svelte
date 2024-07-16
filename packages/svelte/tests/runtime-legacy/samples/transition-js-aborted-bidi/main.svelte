<script>
	export let visible;

	function foo(node) {
		console.log('transition');

		return {
			duration: 100,
			tick: (t) => {
				node.foo = t;
			}
		};
	}
</script>

{#if visible}
	<span transition:foo>hello</span>
{/if}
