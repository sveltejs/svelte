<script>
	import { Widget } from './Widget.svelte';
	let widgets = [Widget];
</script>

{#each widgets as LazyWidget}
	<LazyWidget.Tooltip />
{/each}