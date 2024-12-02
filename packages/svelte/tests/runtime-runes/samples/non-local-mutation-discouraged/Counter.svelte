<script>
	let { object = $bindable(), reset } = $props();
</script>

<button onclick={() => object.count += 1}>
	clicks: {object.count}
</button>
<button onclick={reset}>reset</button>
