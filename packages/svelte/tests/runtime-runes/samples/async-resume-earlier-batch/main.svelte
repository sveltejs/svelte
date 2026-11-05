<script>
	let a = $state(false);
	let c = $state(0);
	let x = $state(0);

	const queue = [];

	function load(label, v) {
		console.log(`${label} ${v}`);
		if (label === 'c' && v === 0) return Promise.resolve(v);

		const d = Promise.withResolvers();
		queue.push(() => d.resolve(v));
		return d.promise;
	}

	let ready = $derived((await load('c', c)) > 0);

	$effect(() => console.log(`commit c=${c} a=${a} x=${x}`));
</script>

<button onclick={() => c++}>c</button>
<button onclick={() => { a = true; x = 1; }}>a</button>
<button onclick={() => queue.shift()?.()}>shift</button>

{#if a}
	<i>{await load('y', 1)}</i>
{/if}

{#if a || ready}
	<p>{await load('x', x)} {x}</p>
{/if}
