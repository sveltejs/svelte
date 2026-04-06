<script>
	let { x } = $props();
</script>

<!-- checks direct source, indirect derived, block effect, async effect -->
{x}
{JSON.stringify(x)}
{#if x === 'universe'}universe{:else}world{/if}
{#if JSON.stringify(x) === '"universe"'}universe{:else}world{/if}
{await Promise.resolve(x)}
{await Promise.resolve(JSON.stringify(x))}