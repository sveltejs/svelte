<script>
	let a = $state(0);
	let b = $state(0);
	let c = $state(0);

	const items = $derived([a * b]);
	const deferred = [];

	function slow(value) {
		if (value === 0) return value;
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}
</script>

<button onclick={() => a++}>a</button>
<button onclick={() => b++}>b</button>
<button onclick={() => c++}>c</button>
<button onclick={() => deferred.shift()?.()}>resolve</button>

{#each items as n}
	{(() => {
		$effect(() => console.log(`effect ${n}`));
	})()}
	<p>item {n}</p>
{/each}

<p>c {c}</p>
<p>slow {await slow(a)}</p>