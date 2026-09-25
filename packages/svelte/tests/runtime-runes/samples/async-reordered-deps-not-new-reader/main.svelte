<script>
	let cond = $state(true);
	let a = $state('a0');
	let b = $state('b0');

	const resolvers = [];
	function slow(v) {
		return new Promise((r) => resolvers.push(() => r(v)));
	}
</script>

<button onclick={() => (cond = !cond)}>flip</button>
<button onclick={() => (a = "a1")}>a</button>
<button onclick={() => (b = "b1")}>b</button>
<button onclick={() => resolvers.shift()?.()}>resolve</button>

<svelte:boundary>
	{#snippet pending()}loading{/snippet}
	<p>{cond ? a + b : b + a}</p>
	<p>{await slow(cond)}</p>
	<p>{await slow(a)}</p>
</svelte:boundary>
