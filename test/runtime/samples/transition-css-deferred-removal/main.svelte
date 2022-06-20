<script>
	export let visible;

	function foo(node) {
		return {
			duration: 200,
			css: t => {
				return `opacity: ${t}`;
			}
		};
	}

	function bar(node) {
		return {
			duration: 100,
			css: t => {
				return `left: ${t * 100}px`;
			}
		};
	}
</script>

{#if visible}
	<span class='outer' out:foo>
		<span class='inner' out:bar>
			double transition
		</span>
	</span>
{/if}