<script>
	import Sync from './Sync.svelte';

	let a = $state(0);
	let b = $state(0);
	let c = $state(0);

	const registry = [];

	function load(value) {
		if (!value) return value;
		return new Promise((resolve) => registry.push(() => resolve(value)));
	}
</script>

<button onclick={() => a++}>a</button>
<button onclick={() => b++}>b</button>
<button
	onclick={() => {
		// the `<p>` values of both batches resolve into their batches (scheduling the same effect in each
		// of them) after this third batch was created, but before it is flushed. The first batch stays pending
		const [p_a, i_a, p_b] = registry.splice(0);
		registry.push(i_a);
		p_b();
		p_a();
		queueMicrotask(() => c++);
	}}>resolve and write</button
>
<button onclick={() => registry.shift()?.()}>resolve</button>

<p>{await load(a)} {await load(b)}</p>
<i>{await load(a)}</i>
<Sync {c} />
