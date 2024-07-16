<script>
	export let visible;

	function foo(node) {
		console.log('in');

		return {
			duration: 100,
			tick: (t) => {
				node.foo = t;
			}
		};
	}

	function bar(node) {
		console.log('out');

		return {
			duration: 100,
			tick: (t) => {
				node.bar = t;
			}
		};
	}
</script>

{#if visible}
	<span in:foo out:bar>hello</span>
{/if}
