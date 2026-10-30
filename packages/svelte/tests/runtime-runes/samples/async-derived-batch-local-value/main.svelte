<script>
	let a = $state(0);
	let b = $state(0);
	let runs = 0;

	// in batch B (b = -1), which doesn't see A's change (a = 1), `d` is -1 — but that
	// is not the real value of `d`, which is 0 (a + b with both changes applied)
	let d = $derived((runs++, a + b));

	const queued = [];

	function push(v) {
		if (!v) return v;
		return new Promise((resolve) => queued.push(() => resolve(v)));
	}

	$effect(() => console.log(`effect ${d}`));
</script>

<button onclick={() => a++}>a++</button>
<button onclick={() => (b = -1)}>b = -1</button>
<button onclick={() => console.log(`real ${d} ${runs}`)}>log</button>
<button onclick={() => queued.shift()?.()}>resolve</button>

<p>{await push(a)} {d}</p>
