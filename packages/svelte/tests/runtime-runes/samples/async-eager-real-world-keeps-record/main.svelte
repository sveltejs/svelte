<script>
	let a = $state(0);
	let b = $state(0);
	let c = $state(0);
	// (reads `c` once `b > 0`, so that its next run in the real world changes its dependencies.
	// `c` is never written, but needs to be reactive, hence the button)
	let d = $derived(b > 0 ? a * 10 + b + c : a * 10);
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
<button onclick={() => c++}>c</button>

<p>{await f('x', d)}</p>
{#if (await f('y', b)) > 0}
	<span>{$state.eager(d)}</span>
{/if}
