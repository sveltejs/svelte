<script>
	let a = $state('a');
	let b = $state('a');
	let c = $state(0);

	let n = 0;

	let queued = [];
	let first = true;

	function push(v) {
		if (first) {
			first = false;
			return v;
		}

		return new Promise((resolve) => {
			queued.push(() => resolve(v));
		});
	}

	// when a batch changing `b` commits, this writes `c` during that batch's
	// flush phase — the write lands in a freshly-created batch
	$effect(() => {
		b;
		c = ++n;
	});
</script>

<button onclick={() => a = 'b'}>a</button>
<button onclick={() => b = 'b'}>b</button>
<button onclick={() => queued.shift()?.()}>shift</button>
<button onclick={() => queued.pop()?.()}>pop</button>

<p>{a}</p>
<p>{b}</p>
<p>{await push(a + b)}</p>
<p>{c}</p>
