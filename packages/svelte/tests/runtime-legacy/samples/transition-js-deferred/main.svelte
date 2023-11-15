<script>
	export let visible;
	let foo_text;
	let bar_text;
	function foo(node, params) {
		foo_text = node.textContent;
		return () => {
			if (bar_text !== `b`) {
				throw new Error(`foo ran prematurely`);
			}
			return {
				duration: 100,
				tick: t => {
					node.foo = t;
				}
			};
		};
	}
	function bar(node, params) {
		bar_text = node.textContent;
		return () => {
			if (foo_text !== `a`) {
				throw new Error(`bar ran prematurely`);
			}
			return {
				duration: 100,
				tick: t => {
					node.foo = t;
				}
			};
		};
	}
</script>

{#if visible}
	<div transition:foo>a</div>
{:else}
	<div transition:bar>b</div>
{/if}