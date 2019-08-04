<script>
	export let visible;
</script>

<div>
	{#if visible}
		<slot/>
	{/if}
</div>