<script>
	let { browser } = $props();

	let fulfil;
	let promise = new Promise((f) => (fulfil = f));

	let num = browser ? promise : 42;
</script>

<button onclick={() => fulfil(42)}>fulfil</button>

{#await num}
	{#if true}<p>loading...</p>{/if}
{:then num}
	<p>{num}</p>
{/await}
