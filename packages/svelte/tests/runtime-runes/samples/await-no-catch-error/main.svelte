<script>
	const promise = new Promise((res, rej) => {
		rej(new Error('Test'));
	})
	let toggle = $state(false);
</script>

<button onclick={() => toggle = !toggle}>toggle</button>

{#if toggle}
	{#await promise}{/await}
{/if}
