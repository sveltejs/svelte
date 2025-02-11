<script>
	let { linked3 = $bindable(), linked4 = $bindable() } = $props();
</script>

<p>Binding</p>
<button onclick={() => linked3.count++}>Increment Linked 1 ({linked3.count})</button>
<button onclick={() => linked4.count++}>Increment Linked 2 ({linked4.count})</button>
