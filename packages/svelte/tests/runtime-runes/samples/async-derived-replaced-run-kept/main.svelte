<script>
	let a = $state(0);
	let b = $state(0);
	let d = $derived(b * 2);
	const pending = new Map();

	function f(tag, ...values) {
		console.log(`${tag} ${values}`);
		return new Promise((resolve) => pending.set(tag, () => resolve(values.join(','))));
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
<button onclick={() => pending.get('y')?.()}>resolve y</button>
<button onclick={resolve_all}>resolve all</button>

<p>{await f('x', a, d)}</p>
<p>{await f('y', a)}</p>
