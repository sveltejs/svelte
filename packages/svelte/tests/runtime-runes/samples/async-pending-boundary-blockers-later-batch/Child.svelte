<script>
	let { show, push } = $props();

	let data = await push('data');
</script>

{#if show}
	<p>{await push(data + '!')}</p>
{/if}
