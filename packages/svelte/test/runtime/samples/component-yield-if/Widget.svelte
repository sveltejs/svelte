<script>
	export let show = false;
</script>

<p>
	{#if show}
		<slot></slot>
	{/if}
</p>