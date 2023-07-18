<script>
	export let foo;
	export let bar;
</script>

<div>
	{#if foo}
		<p>foo!</p>
	{/if}

	{#if bar}
		<p>bar!</p>
	{/if}
</div>