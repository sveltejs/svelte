<script>
	let { onloaded = () => {} } = $props();
</script>

<img alt="a" src="/a.png" onload={onloaded} onerror={onloaded} />
