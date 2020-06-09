<script>
	export let visible;

	let foo_text;
	let bar_text;

	function foo(node, params) {
		foo_text = node.textContent;

		return (is_intro) => {
			if (bar_text !== `b`) {
				if (is_intro != null) throw new Error(`foo ran prematurely`);
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

		return (is_intro) => {
			if (foo_text !== `a`) {
				if (is_intro != null) throw new Error(`bar ran prematurely`);
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
	<div class="foo" transition:foo>a</div>
{:else}
	<div transition:bar>b</div>
{/if}