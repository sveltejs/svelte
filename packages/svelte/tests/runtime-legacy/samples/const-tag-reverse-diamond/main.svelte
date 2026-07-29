<script>
	export let n = 10;
</script>

{#if true}
	{@const sum = left + right}
	{@const left = n + 1}
	{@const right = n + 2}
	<p>{sum}</p>
{/if}
