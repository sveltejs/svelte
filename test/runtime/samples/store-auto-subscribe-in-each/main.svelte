<script>
	export let things;
</script>

{#each things as thing}
	<button on:click="{() => thing.update(n => n.toUpperCase())}">{$thing}</button>
{/each}