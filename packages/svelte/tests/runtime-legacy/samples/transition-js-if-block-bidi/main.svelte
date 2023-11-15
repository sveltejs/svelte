<script>
	export let visible;

	function foo(node, params) {
		global.count += 1;
		return {
			duration: 400,
			tick: t => {
				node.foo = t;
			}
		};
	}
</script>

{#if visible}
	<div transition:foo>foo bidi</div>
{/if}