<script>
	let a = $state(false);
	let b = $state(false);
	let x = $state(0);

	const queue = [];

	function push(label, v) {
		console.log(`${label} ${v}`);
		const d = Promise.withResolvers();
		queue.push(() => d.resolve(v));
		return d.promise;
	}
</script>

<button onclick={() => { a = true; x = 1; }}>a</button>
<button onclick={() => (b = true)}>b</button>
<button onclick={() => queue.shift()?.()}>shift</button>

{#if a || b}
	<p>{await push('x', x)} {x}</p>
{/if}

{#if b && !a}
	<i>{await push('only b', x)}</i>
{/if}
