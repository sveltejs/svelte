<script>
	let a = $state(0);
	let b = $state(0);

	let d = $derived(a * 2);

	const queued = [];
	function push(v) {
		if (!v) return v;
		return new Promise((resolve) => {
			queued.push(() => resolve(v));
		});
	}

	$effect(() => console.log(`b: ${b}, d: ${d}`));
</script>

<button onclick={() => a++}>a++</button>
<button onclick={() => b++}>b++</button>
<button onclick={() => queued.shift()?.()}>resolve</button>

<p>{await push(d)} {b}</p>
