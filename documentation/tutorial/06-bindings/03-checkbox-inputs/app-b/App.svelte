<script>
	let isChecked = false;
</script>

<label>
	<input type="checkbox" bind:checked={isChecked} />
	Yes! Send me regular email spam
</label>

{#if isChecked}
	<p>Thank you. We will bombard your inbox and sell your personal details.</p>
{:else}
	<p>You must opt-in to continue. If you're not paying, you're the product.</p>
{/if}

<button disabled={!isChecked}> Subscribe </button>
