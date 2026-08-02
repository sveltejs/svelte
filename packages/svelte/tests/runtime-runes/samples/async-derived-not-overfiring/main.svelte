<script>
	let a = $state(0);
	let b = $state(0);
	let runs = 0;

	let d = $derived((runs++, a + b));

	const queued = [];
	function push(v) {
		if (!v) return v;
		return new Promise((resolve) => {
			queued.push(() => resolve(v));
		});
	}

	$effect(() => console.log('e1 ' + d));
	$effect(() => console.log('e2 ' + d));
</script>

<button onclick={() => a++}>a++</button>
<button onclick={() => b++}>b++</button>
<button onclick={() => console.log('runs ' + runs)}>log runs</button>
<button onclick={() => queued.shift()?.()}>resolve</button>

<div>
	<p>{await push(a)}</p>
	<p>{d}</p>
	<p>{d}</p>
</div>
