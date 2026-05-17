<script>
	let visible = $state(true);
	let childVisible = $state(true);
</script>

<p>
	{#if visible}
		{#if childVisible}
			child
		{/if}
	{/if}
</p>
