<script>
	let { browser } = $props();
</script>

<!-- svelte-ignore hydration_attribute_changed -->
<img src={browser ? 'a' : 'b'} alt="" />
