<script>
	import Inner from "./Inner.svelte";
	export let defaultValue = '';
	export let slotProps = '';
</script>

<slot {slotProps}><Inner value={defaultValue} /></slot>