<script>
	let count = $state(0);

	const queued = [];

	function push(v) {
		if (v === 0) return v;

		return new Promise((fulfil) => {
			queued.push(() => fulfil(v));
		});
	}
</script>

<button onclick={() => count++}>increment</button>

{#if count < 3}
	{await push(count)}
{:else}
	done
{/if}
