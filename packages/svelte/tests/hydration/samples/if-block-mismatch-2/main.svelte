<script>
	let { condition } = $props();
</script>

{#if condition}
	<slot />
{/if}

<div>
	<slot />
</div>

hello
