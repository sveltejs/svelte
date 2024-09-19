<script>
	export let visible;

	let foo_text;
	let bar_text;

	function foo(node, { duration = 100 }) {
		foo_text = node.textContent;

		return () => {
			if (bar_text !== `b`) {
				throw new Error(`foo ran prematurely`);
			}

			return {
				duration,
				tick: t => {
					node.foo = t;
				}
			};
		};
	}

	function bar(node, { duration = 100 }) {
		bar_text = node.textContent;

		return () => {
			if (foo_text !== `a`) {
				throw new Error(`bar ran prematurely`);
			}

			return {
				duration,
				tick: t => {
					node.foo = t;
				}
			};
		};
	}
</script>

{#if visible}
	<div class="foo" in:foo>a</div>
{:else}
	<div out:bar>b</div>
{/if}
