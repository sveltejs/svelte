<script>
	let yes = false;
</script>

<label>
	<input type=checkbox bind:checked={yes}>
	Yes! Send me regular email spam
</label>

<p>
	{#if yes}
		Thank you. We will bombard your inbox and sell your personal details.
	{:else}
		You must opt in to continue. If you're not paying, you're the product.
	{/if}
</p>

<button disabled={!yes}>
	Subscribe
</button>
