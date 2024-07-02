<script>
	export let visible;

	function foo(node, params) {
		return {
			duration: 100,
			tick: (t) => {
				node.foo = t;
			},
			condition: () => false
		};
	}

	function bar(node, params) {
		return {
			duration: 100,
			tick: (t) => {
				node.bar = t;
			},
			condition: () => false
		};
	}
</script>

{#if visible}
	<div in:foo out:bar />
{/if}
