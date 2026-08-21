<script>
	import Component from './Component.svelte';
	const arr = Array.from({length: 10001});
</script>

{#each arr}
	<Component />
{/each}
