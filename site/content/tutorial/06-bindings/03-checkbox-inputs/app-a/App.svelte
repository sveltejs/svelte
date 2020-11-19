<script>
	let subscribed = false;
</script>

<label>
	<input type=checkbox checked={subscribed}>
	Yes! Send me regular email spam
</label>

{#if subscribed}
	<p>Thank you. We will bombard your inbox and sell your personal details.</p>
{:else}
	<p>You must opt in to continue. If you're not paying, you're the product.</p>
{/if}

<button disabled={!subscribed}>
	Subscribe
</button>
