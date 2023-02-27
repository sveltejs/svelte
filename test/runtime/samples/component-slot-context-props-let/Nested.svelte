<script>
	import Inner from './Inner.svelte';
  export let log;
</script>

<Inner {log} let:key let:set>
	<slot {key} set={(value) => set(key, value)} />
</Inner>