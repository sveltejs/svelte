<script>
	const { attrs } = $props();
	function increment() {
		$attrs.count++;
	}
</script>

<button onclick={increment}>{$attrs.count}</button>
