<script>
	let x = $state({ x: 'world' });
	let y = $state(0);
	let deferred = [];

	const upper = $derived(x.x.toUpperCase());

	function delay(s) {
		const d = Promise.withResolvers();
		deferred.push(() => d.resolve(s));
		return d.promise;
	}
</script>

<button onclick={() => (x = { x: 'universe' })}>x</button>

<button onclick={() => y++}>y++</button>

<button onclick={() => deferred.shift()()}>resolve</button>

<h1>{upper}</h1>

{#if x.x === 'universe'}
	{await delay(x.x)}
{/if}

{#if y > 0}
	<p>{upper}</p>
{/if}
