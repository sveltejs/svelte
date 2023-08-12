<script>
	export let visible;
</script>

<div>
	{#if visible}
		<div>i am visible</div>
	{/if}
	<div>before me</div>
</div>