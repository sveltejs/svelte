<script>
	let item = {
		divider: [1]
	}
</script>

{#if (item.divider && item.divider.includes(1))}
<div class="divider"></div>
{/if}
