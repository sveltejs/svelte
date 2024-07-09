<script>
	let { label, ...rest } = $props();
</script>

<button onclick={() => rest?.onclick()}>{label}</button>
