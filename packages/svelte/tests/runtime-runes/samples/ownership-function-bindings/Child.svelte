<script>
	let { arr = $bindable() } = $props();
</script>

<button onclick={() => arr.push(arr.length)}></button>