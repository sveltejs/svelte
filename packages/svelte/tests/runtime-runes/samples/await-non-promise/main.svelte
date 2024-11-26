<script>
	let count = $state();
</script>

<button onclick={() => count = 1}>number</button>
<button onclick={() => count = null}>nullify</button>

<p>
	{#await count}
		loading
	{:then count}
		{count}
	{/await}
</p>
