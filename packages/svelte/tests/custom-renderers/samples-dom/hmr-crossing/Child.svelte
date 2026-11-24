<script>
	let { message } = $props();

	// see `_config.js`
	globalThis.__record_hmr_wrappers?.('child');
</script>

<b>{message}</b>
