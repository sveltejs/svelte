<script>
	import Component from './Component.svelte';
</script>

{#each Array(2000) as _, i}
	<Component />
{/each}
