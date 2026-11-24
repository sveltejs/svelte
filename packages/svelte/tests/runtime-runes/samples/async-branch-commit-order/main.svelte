<script>
	let a = $state(0);
	let b = $state(0);
	let pend = false;

	const deferred = [];

	function delay(value) {
		if (!pend) return value;
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}

	const k = $derived(b === 0 ? await delay(a) : 'B');
</script>

<p>{await delay(b)}</p>

{#key k}
	<p>{k}</p>
{/key}

<button onclick={() => { pend = true; a = 1; }}>a</button>
<button onclick={() => { pend = true; b = 1; }}>b</button>
<button onclick={() => deferred.shift()()}>shift</button>
