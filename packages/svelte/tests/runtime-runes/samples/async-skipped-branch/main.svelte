<script>
	let show = $state(false);
	let show_async = $state(false);
	let count = $state(0);
</script>

<button onclick={() => {
	show = true;
	show_async = true;
}}>show</button>

{#if show}
	hi
{:else}
	{#if show || !show}
		<button onclick={() => count++}>{count}</button>
	{/if}
{/if}

{#if show_async}
	{await new Promise(() => {})}
{/if}
