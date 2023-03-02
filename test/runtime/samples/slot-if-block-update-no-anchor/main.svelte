<script>
	export let enabled = false;
</script>

<span>
	<slot>
		{#if enabled}enabled{/if}
	</slot>
</span>
