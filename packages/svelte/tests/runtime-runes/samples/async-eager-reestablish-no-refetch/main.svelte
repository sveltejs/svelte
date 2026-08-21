<script>
	let count = $state(-1);
	let eag = $state(0);

	const deferred = [];

	function delay(value) {
		if (value < 0) return value;
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}

	function log(value) {
		console.log(`inner ${value}`);
		return value >= 0;
	}
</script>

<p>{await delay(count)}</p>
{#if count >= 0}
	{#if log($state.eager(eag))}
		<span>{eag}</span>
	{/if}
{/if}
<button onclick={() => count++}>count</button>
<button onclick={() => eag++}>eager</button>
<button onclick={() => deferred.shift()?.()}>shift</button>
