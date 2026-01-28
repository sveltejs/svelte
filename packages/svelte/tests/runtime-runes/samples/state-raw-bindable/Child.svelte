<script>
	let { object = $bindable() } = $props();
</script>

<button onclick={() => (object = { count: object.count + 1 })}>reassign</button>
<button onclick={() => (object.count += 1)}>mutate</button>
