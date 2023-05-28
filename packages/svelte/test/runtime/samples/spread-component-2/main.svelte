<script>
	import Widget from './Widget.svelte';

	export let list;
	export let qux = 0;
</script>

<div>
	{#each list as item, index (item.foo)}
		<Widget {...item} qux={qux} selected={qux === index} />
	{/each}
</div>
