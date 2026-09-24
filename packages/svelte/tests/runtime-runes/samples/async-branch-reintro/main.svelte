<script>
	let count = $state(0);
	let other = $state(0);
	let queued = [];

	function push(v) {
		if (!v) return v;

		return new Promise((resolve) => {
			queued.push(() => resolve(v));
		});
	}
</script>

<button onclick={() => count++}>increment count</button>
<button onclick={() => {count++;other++}}>increment both</button>
<button onclick={() => queued.shift()?.()}>shift</button>

{await push(other)}
{#if count % 2 === 0}
	{await push(count)}
	<button onclick={() => other++}>{other}</button>
{/if}
