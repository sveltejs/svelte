<script>
	export let visible;

	function foo(node, params) {
		return {
			duration: 400,
			tick: t => {
				node.foo = t;
			}
		};
	}

	function bar(node, params) {
		return {
			duration: 400,
			tick: t => {
				node.bar = t;
			}
		};
	}
</script>

{#if visible}
	<div in:foo out:bar>foo then bar</div>
{/if}