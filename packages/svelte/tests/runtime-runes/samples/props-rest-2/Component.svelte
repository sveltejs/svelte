<script>
	let rest = $props();
</script>
<ul>
	{#each Object.getOwnPropertyNames(rest) as n}
			<li>{n}</li>
	{/each}
</ul>
