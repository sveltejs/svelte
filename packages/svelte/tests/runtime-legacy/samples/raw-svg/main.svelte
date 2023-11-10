<script>
	export let show = false;
</script>

{#if show}
	<svg>{@html '<circle cx="200" cy="500" r="200"></circle>'}</svg>
{/if}
