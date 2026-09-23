<script>
	export let n = 1;
	export let show = true;
</script>

{#if show}
	<div data-n={n} tabindex={-1}></div>
{/if}
<p data-n={n}></p>
