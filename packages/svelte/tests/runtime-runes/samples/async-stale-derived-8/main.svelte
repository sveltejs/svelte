
<script>
	let count = $state(0);
	let other = $state(0);

	const queue = [];

	function push(v) {
		if (v === 0) return v;

		return new Promise((resolve) => queue.push(() => resolve(v)));
	}
</script>

<button onclick={() => {
	if (count === 0) other++;
	count++;
}}>increment</button>
<button onclick={() => queue.pop()?.()}>pop</button>

{#if count > 0}
	{await push(count)} {count} {other}
{/if}
