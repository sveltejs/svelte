<script>
	let a = $state(0);
	let b = $state(0);
	let a_b = $derived(a * b);

	const queued = [];

	function push(value) {
		if (!value) return value;
		return new Promise(resolve => {
			queued.push(() => resolve(value));
		});
	}
</script>

<button onclick={() => (a++)}>a</button>
<button onclick={() => (b++)}>b</button>
<button onclick={() => (queued.shift()?.())}>resolve</button>
<!-- a_b called in a block effect before being called in an async effect -->
{#if a_b}hi{/if}
{await push(a_b)}
