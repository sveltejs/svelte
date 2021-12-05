<script>
	export let visible;

	function foo(node, params) {
		return {
			delay: 50,
			duration: 100,
			tick: t => {
				node.foo = t;
			}
		};
	}

	function bar(node, params) {
		return {
			delay: 50,
			duration: 100,
			tick: t => {
				node.bar = t;
			}
		};
	}
</script>

{#if visible}
	<div in:foo out:bar>delayed</div>
{/if}