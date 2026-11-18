<script>
	let flag = $state(true);
	let a = $state(1);
	let b = $state(0);
	const pending = [];

	function wait(v) {
		return new Promise((r) => pending.push(() => r(v)));
	}
</script>

<button onclick={() => (flag = false)}>flag</button>
<button onclick={() => (a = 2)}>a</button>
<button onclick={() => pending.shift()?.()}>resolve</button>

<svelte:boundary>
	<p>{await wait(flag)}</p>

	{#if flag ? a : b}
		<span>yes</span>
	{:else}
		<span>no</span>
	{/if}

	{#snippet pending()}<p>loading</p>{/snippet}
</svelte:boundary>
