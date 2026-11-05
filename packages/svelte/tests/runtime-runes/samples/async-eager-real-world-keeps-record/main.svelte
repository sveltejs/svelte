<script>
	let a = $state(0);
	let b = $state(0);
	let other = $state(0);
	// (only reads `a` once `b > 0`, so that A's write doesn't reach `f('x', d)` — A doesn't
	// run it, and B, which does, doesn't fold A into its view)
	let d = $derived(b > 0 ? a * 10 + b : 0);
	const pending = new Map();

	function f(tag, ...values) {
		console.log(`${tag} ${values}`);
		return new Promise((resolve) => pending.set(tag, () => resolve(values.join(','))));
	}

	function resolve(tag) {
		pending.get(tag)?.();
		pending.delete(tag);
	}

	function resolve_all() {
		for (const resolve of pending.values()) resolve();
		pending.clear();
	}

	// nothing (including the buttons) shows up until the initial render resolves
	queueMicrotask(resolve_all);
</script>

<button onclick={() => a++}>a</button>
<button onclick={() => b++}>b</button>
<button onclick={() => other++}>other</button>
<button onclick={() => resolve('y')}>resolve y</button>
<button onclick={() => resolve('x')}>resolve x</button>
<button onclick={resolve_all}>resolve all</button>

<b>{other}</b>
<p>{await f('z', a)}</p>
<p>{await f('x', d)}</p>
<!-- (the branch is only created once B is processed again, i.e. once B holds its record of `d`) -->
{#if (await f('y', b)) > 0}
	<span>{$state.eager(d)}</span>
{/if}
