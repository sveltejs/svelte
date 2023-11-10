<script>
	export let things;

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

{#each things as thing}
	<p>{thing}</p>
{:else}
	<div in:foo out:bar>else</div>
{/each}