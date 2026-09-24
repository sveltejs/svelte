<script>
	let count = $state(0);
	let other = $state(0);

	const queue = [];
  	let pending = $derived(defaultPending);
	function push(v) {
		return new Promise((resolve) => queue.push(() => resolve(v)));
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
{#snippet defaultPending()}
  <p>Loading...</p>
{/snippet}

{#if count > 0}
	<svelte:boundary {pending}>
		{await push(count)} {count} {other}
	</svelte:boundary> 
{/if}
