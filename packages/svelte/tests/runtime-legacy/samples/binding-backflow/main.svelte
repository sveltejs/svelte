<script>
	import Parent from './Parent.svelte';
	export let configs = [];
	export let parents = {};
</script>

{#each configs as config}
	<Parent bind:this={parents[config.testcase]} value={config.value} testcase={config.testcase} />
{/each}
