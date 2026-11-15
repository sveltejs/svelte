<script lang="ts">
	let x = $state(0);
	let y = $state(0);
	const sum = $derived(x + y);
	const items = $derived(sum % 2 ? [-1, sum] : [sum, -1]);

	let delay = false;
	const pending: (() => void)[] = [];

	function load(item: number, index: number) {
		const value = `${item}@${index}`;
		if (!delay) return value;
		return new Promise<string>((resolve) => pending.push(() => resolve(value)));
	}

	function resolve_latest() {
		// Each batch starts two requests, one per item. Resolve the newest pair first.
		for (const resolve of pending.splice(-2)) resolve();
	}
</script>

<button onclick={() => { delay = true; x = 1; }}>a</button>
<button onclick={() => { delay = true; y = 1; }}>b</button>
<button onclick={resolve_latest}>resolve latest</button>

<output>
	<p>{x}/{y}</p>
	{#each items as item, index (item === -1 ? 'anchor' : 'value')}
		<p>{item}@{index} = {await load(item, index)}</p>
	{/each}
</output>
