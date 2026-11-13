<script>
	import { fork } from 'svelte';

	let a = $state(false);
	let b = $state(false);
	let x = $state(0);
	let y = $state(0);
	let f;

	let queue = [];

	function push(v) {
		if (v === 0) return v;

		const d = Promise.withResolvers();
		queue.push({ v, resolve: () => d.resolve(v) });
		return d.promise;
	}

	function resolve(v) {
		const i = queue.findIndex((e) => e.v === v);
		if (i !== -1) queue.splice(i, 1)[0].resolve();
	}

	function set_a() {
		a = true;
		x = 1;
		y = 1;
	}

	function reset() {
		f?.discard();
		f = undefined;
		queue = [];
		a = b = false;
		x = y = 0;
	}
</script>

<button onclick={() => (b = true)}>b</button>
<button onclick={set_a}>a</button>
<button onclick={() => (f = fork(set_a))}>fork a</button>
<button onclick={() => resolve('x0')}>x0</button>
<button onclick={() => resolve('x1')}>x1</button>
<button onclick={() => resolve(1)}>y</button>
<button onclick={() => f?.commit()}>commit</button>
<button onclick={reset}>reset</button>

<i>{x}</i>
<b>{await push(y)}</b>

{#if a || b}
	{#if (await push(`x${x}`)) !== null}<p>x is {x}</p>{/if}
{/if}
