<script>
	let x = $state(0);
	let y = $state(0);

	const pending = new Map();

	function f(tag, value) {
		console.log(`${tag} ${value}`);
		if (value === 0) return value;
		return new Promise((resolve) => pending.set(`${tag} ${value}`, () => resolve(value)));
	}

	function resolve(key) {
		pending.get(key)?.();
		pending.delete(key);
	}

	let z = $derived(await f('y', y));
</script>

<button onclick={() => (x++, y++)}>start A</button>
<button onclick={() => (x = 2)}>start B</button>
<button onclick={() => (resolve('x 1'), resolve('y 1'))}>resolve A</button>
<button onclick={() => (resolve('x 2'), resolve('z 1'))}>resolve B</button>

<span>x: {await f('x', x)}</span>

{#if x > 1}
	<p>z: {z}</p>
	{#if z > 0}
		<p>z: {await f('z', z)}</p>
	{/if}
{/if}
