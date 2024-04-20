<script>
	import Inner from './Inner.svelte';
</script>

<Inner let:key let:set>
	<slot {key} set={(value) => set(key, value)} />
</Inner>
