<script>
	let inited = false;
	let a = $state(0);
	let b = $state(0);
	let c = $state(0);
	let sum = $derived(a + b);
	const registry = [];

	let slow = $derived(await f('slow', c));

	$effect(() => {
		console.log(sum);
	});

	function f(tag, value) {
		if (!inited) return `${tag}${value}`;
		return new Promise((resolve) => registry.push(() => resolve(`${tag}${value}`)));
	}

	function shift() {
		registry.shift()?.();
	}

	$effect(() => {
		inited = true;
	});
</script>

<button onclick={shift}>shift</button>
<button onclick={() => (b = 1)}>b = 1</button>
<button onclick={() => (b = 0)}>b = 0</button>

<div id="output">
	<p>{await f('p', a)}|{sum}</p>
	{#key c}
		<em>{slow}|{await f('key', b)}</em>
	{/key}
</div>
