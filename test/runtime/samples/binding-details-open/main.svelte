<script>
	export let visible;
</script>

<details bind:open={visible}><summary>toggle</summary></details>

{#if visible}
	<p>hello!</p>
{/if}
