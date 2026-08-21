<script>
	import Child from "./Child.svelte";
	let count = $state(0);

	let deferreds = [];

	function push(v) {
		return new Promise((resolve, reject) => {
			deferreds.push({ resolve: () => resolve(v), reject });
		});
	}
</script>

<button onclick={() => count += 1}>increment</button>
<button onclick={() => deferreds.shift()?.resolve()}>resolve</button>

<svelte:boundary>
	{#if count % 2 === 0}
		{@const double = count * 2}
		<p>true</p>
		{await push(count)} {double}
		<Child count={await push(count)} />
	{:else}
		<p>false</p>
		<Child count={await push(count)} />
	{/if}

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>
