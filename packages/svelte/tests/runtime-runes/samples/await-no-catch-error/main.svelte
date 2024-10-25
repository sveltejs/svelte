<script>
	const promise = Promise.reject('Test');
	let toggle = $state(false);
</script>

<button onclick={() => toggle = !toggle}>toggle</button>

{#if toggle}
	{#await promise}{/await}
{/if}
