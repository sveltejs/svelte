<script>
	let { browser } = $props();
</script>

<!-- svelte-ignore hydration_html_changed -->
{@html browser ? 'a' : 'b'}
