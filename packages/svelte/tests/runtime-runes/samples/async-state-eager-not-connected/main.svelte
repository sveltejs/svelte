<script>
	let count = $state(0);
	let eager = $state(false);
	let plain = $state(false);

	const deferred = [];

	function delay(value) {
		if (!value) return value;
		return new Promise((resolve) => deferred.push(() => resolve(value)));
	}
</script>

<button onclick={() => count++}>count</button>
<button onclick={() => (eager = true)}>eager</button>
<button onclick={() => (plain = true)}>plain</button>
<button onclick={() => deferred.shift()?.()}>shift</button>

<p>{await delay(count)}</p>

{#if eager}
	<span>{$state.eager(count)}</span>
{/if}

{#if plain}
	<b>{count}</b>
{/if}
