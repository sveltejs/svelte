<script>
	import Child from './child.svelte';
</script>

<Child>
	{#snippet children()}
		<p>explicit children snippet</p>
	{/snippet}
</Child>

<Child>
	{#snippet header()}titled{/snippet}
</Child>
