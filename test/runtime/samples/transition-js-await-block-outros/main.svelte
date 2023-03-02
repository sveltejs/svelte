<script>
	export let promise;

	function foo(node) {
		return {
			duration: 100,
			tick: t => {
				node.setAttribute('foo', t.toFixed(1));
			}
		};
	}
</script>

{#await promise}
	<p class='pending' transition:foo>loading...</p>
{:then value}
	<p class='then' transition:foo>{value}</p>
{:catch error}
	<p class='catch' transition:foo>{error.message}</p>
{/await}