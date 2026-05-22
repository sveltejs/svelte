<script>
	let { data } = $props();

	const processed = $derived(data.toUpperCase());

	export function getProcessed() {
		return processed;
	}
</script>
