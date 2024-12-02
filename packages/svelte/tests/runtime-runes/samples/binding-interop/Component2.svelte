<script>
	let { object = $bindable({}), primitive = $bindable('') } = $props();
</script>

{#if primitive}
	<button onclick={() => (primitive = 'bar')}>{primitive}</button>
{:else}
	<button onclick={() => (object.value = 'bar')}>{object.value}</button>
{/if}
