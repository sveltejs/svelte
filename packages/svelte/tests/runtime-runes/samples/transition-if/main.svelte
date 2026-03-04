<script>
	function foo(node) {
		return {
			duration: 100,
			tick: (t, u) => {
				node.setAttribute('foo', t)
			}
		};
	}

	let x = $state(true);
	let y = $state(true);
</script>

<button onclick={() => {
	x = !x;
}}>toggle x</button>
<button onclick={() => {
	y = !y;
}}>toggle y</button>

{#if x && y}
	<p transition:foo>hello</p>
{/if}
