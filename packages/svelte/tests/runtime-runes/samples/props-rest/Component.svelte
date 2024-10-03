<script>
	let {
			children,
			...rest
	} = $props();
</script>
{@render children?.()}
<ul>
	{#each Object.getOwnPropertyNames(rest) as n}
			<li>{n}</li>
	{/each}
</ul>
