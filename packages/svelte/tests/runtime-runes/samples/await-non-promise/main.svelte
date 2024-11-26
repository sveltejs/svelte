<script>
	let count = $state(0);
</script>

<button onclick={() => count += 1}>increment</button>
<button onclick={() => count = null}>nullify</button>

<p>
	{#await count}
		loading
	{:then count}
		{count}
	{/await}
</p>
