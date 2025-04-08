<script>
	let { browser } = $props();

	let fulfil;
	let promise = new Promise((f) => (fulfil = f));

	let a = browser ? promise : 42;
	let b = browser ? 42 : promise;
</script>

<button onclick={() => fulfil(42)}>fulfil</button>

{#await a}
	{#if true}<p>loading...</p>{/if}
{:then a}
	<p>{a}</p>
{/await}

<hr>

{#await b}
	{#if true}<p>loading...</p>{/if}
{:then b}
	<p>{b}</p>
{/await}
