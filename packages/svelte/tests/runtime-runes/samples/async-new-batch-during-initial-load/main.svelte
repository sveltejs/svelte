<script>
	let count = $state(0);
	let other = $state(0);

	const queue = [];
	function push(v) {
		return new Promise((r,e) => queue.push(() => v === 1 ? e(v) : r(v)));
	}
</script>

<button onclick={() => {
	if (count === 0) {
		other++;
		count++;
	} else {
		count++
	}
}}>increment</button>
<button onclick={() => queue.pop()?.()}>pop</button>

{#if count > 0}
	<svelte:boundary>
		{await push(count)} {count} {other}
		{#snippet failed()}boom{/snippet}
	</svelte:boundary> 
{/if}
