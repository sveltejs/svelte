<script>
	import { untrack } from 'svelte';
	let a = $state(1);
	let b = $state(2);
	let c = $state(3);

	async function a_plus_b_plus_c() {
		return await a + await b + await untrack(() => c);
	}
</script>

<button onclick={() => a++}>a</button>
<button onclick={() => b++}>b</button>
<button onclick={() => c++}>c</button>

<svelte:boundary>
	<h1>{await a_plus_b_plus_c()}</h1>
	<p>{await a + await b + await c}</p>

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
