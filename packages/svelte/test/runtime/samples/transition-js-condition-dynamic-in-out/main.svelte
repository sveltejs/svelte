<script>
	export let visible;
	export let conditionIn;
	export let conditionOut;

	function foo(node, params) {
		return {
			duration: 100,
			tick: (t) => {
				node.foo = t;
			},
			condition: conditionIn
		};
	}

	function bar(node, params) {
		return {
			duration: 100,
			tick: (t) => {
				node.bar = t;
			},
			condition: conditionOut
		};
	}
</script>

{#if visible}
	<div in:foo out:bar />
{/if}
