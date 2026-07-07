<script>
	let a = $state(0);
	let b = $state(10);

	const deferred = [];

	function delay(value) {
		if (!value) return value;
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}

	let sum = $derived(a + b);
</script>

<button onclick={() => (a += 1)}>a</button>
<button onclick={() => (b += 10)}>b</button>
<button onclick={() => deferred.shift()?.()}>shift</button>
<button onclick={() => console.log(sum)}>read</button>

<p>{sum}</p>
<p>{await delay(a)}</p>
