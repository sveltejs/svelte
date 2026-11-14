<script>
	let q = $state(0);
	let r = $state(0);
	let p = $state(0);
	let s = $state(0);
	let t = $state(0);

	const resolvers = { q: [], r: [], p: [], t: [] };

	function slow(kind, v) {
		return new Promise((resolve) => resolvers[kind].push(() => resolve(v)));
	}
</script>

<button onclick={() => { q++; r++; }}>A0</button>
<button onclick={() => { q++; p++; s++; }}>A</button>
<button onclick={() => { s++; t++; }}>B</button>
<button onclick={() => resolvers.q.pop()?.()}>resolve q</button>
<button onclick={() => resolvers.p.pop()?.()}>resolve p</button>
<button onclick={() => resolvers.t.pop()?.()}>resolve t</button>
<button onclick={() => resolvers.r.shift()?.()}>resolve r</button>
<button onclick={() => { for (const k in resolvers) resolvers[k].shift()?.(); }}>init</button>

<svelte:boundary>
	{#snippet pending()}loading{/snippet}
	<p>q{await slow('q', q)} r{await slow('r', r)} p{await slow('p', p)} t{await slow('t', t)} s{s}</p>
</svelte:boundary>
