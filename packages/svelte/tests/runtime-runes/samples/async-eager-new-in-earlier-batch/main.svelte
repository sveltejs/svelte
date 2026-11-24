<script>
	let a = $state(0);
	let x = $state(0);

	const queued = [];

	function delay(v) {
		if (!v) return v;
		return new Promise((r) => queued.push(() => r(v)));
	}

	function log(v) {
		console.log(v);
		return v;
	}
</script>

<button onclick={() => a++}>a</button>
<button onclick={() => x++}>x</button>
<button onclick={() => queued.shift()?.()}>shift</button>

{#if await delay(a)}
	<p>{$state.eager(log(x))}</p>
{/if}

<span>{await delay(x)}</span>
