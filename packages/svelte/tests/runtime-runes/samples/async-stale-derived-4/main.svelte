<script>
	let show = $state(true);
	let count = $state(0);

	const queue = [];

	function push(value) {
		if (!value) return value;
		return new Promise(r => queue.push(() => r(value)));
	}
</script>

<button onclick={() => count += 1}>increment</button>
<button onclick={() => show = false}>hide</button>
<!-- pop() so that the outer one resolves first, not the one inside the if block -->
<button onclick={() => queue.pop()?.()}>pop</button>

{await push(count)}
{#if show}
	{await push(count)}
{/if}
