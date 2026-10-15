<script>
	let { total, navigating } = $props();
	const pages = $derived(Math.ceil(total / 28));
	const pending = $derived(navigating && pages > 1);
</script>

{#if pending}pending{/if}
<p>{pages}</p>
