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

	let v = $derived(await f('g', y));
</script>

<button
	onclick={() => {
		x = 1;
		y = 1;
	}}>B</button
>
<button onclick={() => (x = 2)}>L</button>
<button
	onclick={() => {
		resolve('x 1');
		resolve('g 1');
	}}>resolve B</button
>
<button onclick={() => {
	resolve('x 2');
	resolve('v 1');
}}>resolve L</button>

<span>x: {await f('x', x)}</span>

{#if x > 1}
	<p>v: {v}</p>
	{#if v > 0}
		<p>v: {await f('v', v)}</p>
	{/if}
{/if}
