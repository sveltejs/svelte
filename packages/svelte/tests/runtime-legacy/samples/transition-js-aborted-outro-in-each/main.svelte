<script>
	export let things;

	function foo(node, params) {
		return {
			delay: params.delay,
			duration: 100,
			tick: t => {
				node.foo = t;
			}
		};
	}
</script>

{#each things as thing, i}
	<span out:foo="{{delay: i * 50}}">{thing}</span>
{/each}
